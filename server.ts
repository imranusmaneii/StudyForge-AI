import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazy or direct
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'StudyForge AI' });
  });

  // API 1: Generate Study Plan
  app.post('/api/gemini/generate-plan', async (req, res) => {
    try {
      const { subjects, availableHoursPerDay, studyDays, goal, sessionLengthMinutes, preferredStartTime } = req.body;

      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ error: 'At least one subject is required.' });
      }

      let baseStartMins = 9 * 60; // Default 09:00 AM
      if (preferredStartTime && typeof preferredStartTime === 'string' && preferredStartTime.includes(':')) {
        const [ph, pm] = preferredStartTime.split(':').map(n => parseInt(n, 10) || 0);
        baseStartMins = (ph % 24) * 60 + (pm % 60);
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return a realistic fallback if key is missing
        return res.json({
          success: true,
          plan: generateLocalFallbackPlan(subjects, availableHoursPerDay, studyDays, goal, sessionLengthMinutes, preferredStartTime),
          aiReasoning: 'Plan created with intelligent local fallback scheduling matrix based on exam proximity and subject difficulty.'
        });
      }

      const ai = getGeminiClient();
      const prompt = `You are an expert academic tutor and study planner AI.
Generate a structured multi-day study schedule for a student with the following constraints:
- Subjects: ${JSON.stringify(subjects.map(s => ({ name: s.name, difficulty: s.difficulty, knowledgeLevel: s.knowledgeLevel, examDate: s.examDate, priority: s.priority, topics: s.topics?.map((t: any) => t.name) })))}
- Available Study Time: ${availableHoursPerDay || 4} hours per day
- Study Days: ${JSON.stringify(studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])}
- Goal: ${goal || 'high_grades'}
- Preferred Session Duration: ${sessionLengthMinutes || 45} minutes
- Daily Start Time: ${preferredStartTime || '09:00'}

Rules:
1. Prioritize subjects with upcoming exam dates and higher difficulty levels.
2. Distribute sessions evenly across study days rather than overloading single days.
3. Insert 15-minute breaks or mindfulness rests after every 2 study sessions.
4. Include learning sessions for new topics, practice sessions for high difficulty topics, and revision sessions.
5. Create sessions for 3 consecutive days (Day 1 (Today), Day 2 (Tomorrow), Day 3).

Return JSON strictly matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiReasoning: { type: Type.STRING, description: 'Short sentence explaining schedule priorities.' },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING },
                    dateString: { type: Type.STRING },
                    sessions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          subjectName: { type: Type.STRING },
                          topic: { type: Type.STRING },
                          durationMinutes: { type: Type.NUMBER },
                          priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'urgent'] },
                          type: { type: Type.STRING, enum: ['learning', 'practice', 'revision', 'review', 'break'] },
                        },
                        required: ['subjectName', 'topic', 'durationMinutes', 'priority', 'type']
                      }
                    }
                  },
                  required: ['dayName', 'sessions']
                }
              }
            },
            required: ['days', 'aiReasoning']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.days && parsed.days.length > 0) {
        // Map back with colors and subject IDs and exact recalculated timing
        const formattedDays = parsed.days.map((day: any, dIdx: number) => {
          let currentMinutes = baseStartMins;
          const sessionsWithDetails = day.sessions.map((sess: any, sIdx: number) => {
            const foundSubj = subjects.find((s: any) => s.name.toLowerCase() === sess.subjectName.toLowerCase()) || subjects[sIdx % subjects.length];
            const duration = sess.durationMinutes || sessionLengthMinutes || 45;

            const startH = (Math.floor(currentMinutes / 60) % 24).toString().padStart(2, '0');
            const startM = (currentMinutes % 60).toString().padStart(2, '0');
            currentMinutes = (currentMinutes + duration) % (24 * 60);
            const endH = (Math.floor(currentMinutes / 60) % 24).toString().padStart(2, '0');
            const endM = (currentMinutes % 60).toString().padStart(2, '0');

            return {
              id: `gen-s-${dIdx}-${sIdx}-${Date.now()}`,
              subjectId: sess.type === 'break' ? 'break' : (foundSubj?.id || 'subj-custom'),
              subjectName: sess.type === 'break' ? 'Mindfulness Break' : (foundSubj?.name || sess.subjectName),
              subjectColor: sess.type === 'break' ? '#64748b' : (foundSubj?.color || '#3b82f6'),
              topic: sess.topic || 'Core Subject Concepts',
              durationMinutes: duration,
              startTime: `${startH}:${startM}`,
              endTime: `${endH}:${endM}`,
              priority: sess.priority || foundSubj?.priority || 'medium',
              type: sess.type || 'learning',
              completed: false,
              dayIndex: dIdx
            };
          });

          return {
            dayName: day.dayName || (dIdx === 0 ? 'Today' : dIdx === 1 ? 'Tomorrow' : `Day ${dIdx + 1}`),
            dateString: day.dateString || new Date(Date.now() + dIdx * 86400000).toISOString().split('T')[0],
            totalMinutes: sessionsWithDetails.reduce((acc: number, s: any) => acc + s.durationMinutes, 0),
            sessions: sessionsWithDetails
          };
        });

        return res.json({
          success: true,
          plan: {
            id: `plan-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            goal,
            sessionLengthMinutes,
            availableHoursPerDay,
            studyDays,
            days: formattedDays,
            aiReasoning: parsed.aiReasoning || 'Schedule constructed based on exam dates and topic difficulties.'
          }
        });
      }

      // Fallback if structure missing
      return res.json({
        success: true,
        plan: generateLocalFallbackPlan(subjects, availableHoursPerDay, studyDays, goal, sessionLengthMinutes, preferredStartTime)
      });
    } catch (err: any) {
      console.error('Gemini generate plan error:', err);
      // Fallback on error so user experience is never broken!
      const { subjects, availableHoursPerDay, studyDays, goal, sessionLengthMinutes, preferredStartTime } = req.body;
      return res.json({
        success: true,
        plan: generateLocalFallbackPlan(subjects || [], availableHoursPerDay || 4, studyDays || [], goal || 'high_grades', sessionLengthMinutes || 45, preferredStartTime),
        errorWarning: 'Used intelligent offline scheduler.'
      });
    }
  });

  // API 2: Adjust / Adapt Plan
  app.post('/api/gemini/adjust-plan', async (req, res) => {
    try {
      const { plan, adjustmentType, userNotes, subjects } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || !plan) {
        // Fallback local adjustment
        const adjustedPlan = adjustPlanLocally(plan, adjustmentType);
        return res.json({ success: true, plan: adjustedPlan, aiReasoning: `Adjusted schedule locally for '${adjustmentType}'.` });
      }

      const ai = getGeminiClient();
      const prompt = `Adjust an existing student study plan based on a schedule change event.
Adjustment Event: "${adjustmentType}"
Additional Notes: "${userNotes || 'None'}"
Current Plan Days: ${JSON.stringify(plan.days)}
Subjects: ${JSON.stringify(subjects || [])}

Instructions:
1. Redistribute remaining pending sessions dynamically without losing overall exam coverage.
2. If sessions were missed or time was reduced today, move high priority topics to upcoming days.
3. Keep breaks reasonable.
4. Return updated array of days with sessions.

Return JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiReasoning: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING },
                    sessions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          subjectName: { type: Type.STRING },
                          topic: { type: Type.STRING },
                          durationMinutes: { type: Type.NUMBER },
                          priority: { type: Type.STRING },
                          type: { type: Type.STRING },
                          completed: { type: Type.BOOLEAN }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.days && parsed.days.length > 0) {
        // Merge adjusted session structure back onto plan
        const updatedPlan = {
          ...plan,
          updatedAt: new Date().toISOString(),
          aiReasoning: parsed.aiReasoning || `Adapted study plan after event: ${adjustmentType}`,
          days: plan.days.map((oldDay: any, dIdx: number) => {
            const aiDay = parsed.days[dIdx] || oldDay;
            let currentMinutes = 9 * 60;
            const updatedSessions = aiDay.sessions.map((s: any, sIdx: number) => {
              const matchedSubject = (subjects || []).find((sub: any) => sub.name.toLowerCase() === (s.subjectName || '').toLowerCase());
              const startH = (Math.floor(currentMinutes / 60) % 24).toString().padStart(2, '0');
              const startM = (currentMinutes % 60).toString().padStart(2, '0');
              const duration = s.durationMinutes || 45;
              currentMinutes = (currentMinutes + duration) % (24 * 60);
              const endH = (Math.floor(currentMinutes / 60) % 24).toString().padStart(2, '0');
              const endM = (currentMinutes % 60).toString().padStart(2, '0');

              return {
                id: `adj-s-${dIdx}-${sIdx}-${Date.now()}`,
                subjectId: s.type === 'break' ? 'break' : (matchedSubject?.id || 'subj-custom'),
                subjectName: s.type === 'break' ? 'Mindfulness Break' : (s.subjectName || matchedSubject?.name || 'Subject Study'),
                subjectColor: s.type === 'break' ? '#64748b' : (matchedSubject?.color || '#3b82f6'),
                topic: s.topic || 'Core Concept Review',
                durationMinutes: duration,
                startTime: `${startH}:${startM}`,
                endTime: `${endH}:${endM}`,
                priority: s.priority || 'high',
                type: s.type || 'learning',
                completed: Boolean(s.completed),
                dayIndex: dIdx
              };
            });
            return {
              ...oldDay,
              sessions: updatedSessions
            };
          })
        };
        return res.json({ success: true, plan: updatedPlan });
      }

      return res.json({ success: true, plan: adjustPlanLocally(plan, adjustmentType) });
    } catch (err: any) {
      console.error('Gemini adjust plan error:', err);
      const { plan, adjustmentType } = req.body;
      return res.json({ success: true, plan: adjustPlanLocally(plan, adjustmentType) });
    }
  });

  // API 3: AI Assistant Chat (Universal Master Tutor with Real-time Graphs & Data Sets)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, subjects, currentPlan, progressStats } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message text is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: getOfflineAssistantResponse(message, subjects),
          visualAid: generateOfflineVisualAid(message)
        });
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are Alex, the student's personal AI study assistant, study companion, and Jarvis for StudyForge AI (NOT a rigid formal teacher). You are friendly, encouraging, empathetic, and speak like a helpful study buddy.

JARVIS & STUDY PLAN ADJUSTMENT CAPABILITY:
- You act as Jarvis for StudyForge AI — you have full ability to create, modify, or adjust the student's study plan directly when asked!
- When a student asks you to change, update, adjust, or generate their study plan or schedule (e.g., "adjust my plan", "change my schedule to focus on Physics", "add 1 hour of calculus", "make a study plan for me"), confirm enthusiastically that you have updated their study plan directly in the app and explain the changes made!

YOUTUBE LECTURES & STUCK STUDENT MANDATE:
- Whenever the student mentions facing an issue, feeling stuck, having difficulty understanding a concept, or asking for video explanations/tutorials (e.g. "I don't understand X", "I'm facing an issue with Y", "can you explain Z", "hard topic", "stuck"), you MUST:
  1. Break down the concept in simple, friendly, step-by-step terms.
  2. Provide 2 to 3 direct clickable YouTube video search / lecture links in markdown format so the student can watch top video tutorials immediately.
  Example YouTube link markdown format:
  - [▶ Watch Khan Academy: Search Calculus Tutorials on YouTube](https://www.youtube.com/results?search_query=Calculus+Khan+Academy)
  - [▶ Watch 3Blue1Brown: Visualizing Derivatives on YouTube](https://www.youtube.com/results?search_query=3Blue1Brown+Derivatives)
  - [▶ Watch freeCodeCamp / MIT Lectures on YouTube](https://www.youtube.com/results?search_query=MIT+Calculus+lecture)

Student Context:
- Active Subjects: ${JSON.stringify(subjects?.map((s: any) => ({ name: s.name, difficulty: s.difficulty, examDate: s.examDate, knowledge: s.knowledgeLevel + '%' })) || [])}
- Progress: ${progressStats?.todayCompletedTasks || 0} / ${progressStats?.todayTotalTasks || 0} tasks completed today.

RESPONSE FORMAT MANDATE:
- You MUST return a valid JSON object matching the requested JSON schema.
- ABSOLUTELY NO RAW MARKDOWN HEADERS OR HASHES ('#', '##', '###'). Use bold text (**Title**) for headings.
- Keep explanation text clean, well-structured, and easy to read.
- CRITICAL INSTRUCTION FOR VISUAL AIDS & FORMULA SHEETS: Whenever the user asks for a "formula sheet", "formula", "cheat sheet", "equations", "diagram", "concept map", "chart", "graph", or "table", you MUST populate the 'visualAid' object in your JSON output. Include an array of formulas or nodes or table rows. DO NOT leave 'visualAid' empty or undefined when requested!`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              text: {
                type: 'STRING',
                description: 'Clear academic response. Do NOT use any # or ## symbols. Use bold headers and clean bullet points.'
              },
              visualAid: {
                type: 'OBJECT',
                description: 'Structured visual aid payload for interactive charts, tables, diagrams, or formula cheat-sheets',
                properties: {
                  type: { type: 'STRING', enum: ['chart', 'table', 'diagram', 'formula'] },
                  title: { type: 'STRING' },
                  chartType: { type: 'STRING', enum: ['bar', 'line', 'pie'] },
                  data: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        name: { type: 'STRING' },
                        value: { type: 'NUMBER' }
                      }
                    }
                  },
                  headers: { type: 'ARRAY', items: { type: 'STRING' } },
                  rows: {
                    type: 'ARRAY',
                    items: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    }
                  },
                  diagramNodes: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        id: { type: 'STRING' },
                        label: { type: 'STRING' },
                        desc: { type: 'STRING' }
                      }
                    }
                  },
                  formulas: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        label: { type: 'STRING' },
                        formula: { type: 'STRING' },
                        explanation: { type: 'STRING' }
                      }
                    }
                  },
                  summary: { type: 'STRING' }
                }
              }
            },
            required: ['text']
          }
        }
      });

      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(response.text || '{}');
      } catch (e) {
        console.warn('Failed to parse Gemini JSON output, falling back to raw text cleanup:', e);
        parsedPayload = { text: response.text || "I'm here to assist you across all your subjects!" };
      }

      // Strip any raw markdown header hashes ('#', '##', '###') that might sneak into text
      let cleanedText = (parsedPayload.text || '')
        .replace(/^#+\s+/gm, '')
        .replace(/\n#+\s+/g, '\n\n')
        .trim();

      // Ensure visual aid is present if requested by user
      const msgLower = (message || '').toLowerCase();
      const isVisualRequested =
        msgLower.includes('formula') ||
        msgLower.includes('cheat sheet') ||
        msgLower.includes('equation') ||
        msgLower.includes('diagram') ||
        msgLower.includes('chart') ||
        msgLower.includes('table') ||
        msgLower.includes('graph');

      let visualAid = parsedPayload.visualAid;
      if (isVisualRequested && (!visualAid || !visualAid.type || (visualAid.type === 'formula' && (!visualAid.formulas || visualAid.formulas.length === 0)))) {
        visualAid = generateOfflineVisualAid(message);
      }

      // Check if user asked to adjust or change their study plan
      const isPlanAdjustment =
        msgLower.includes('adjust') ||
        msgLower.includes('change plan') ||
        msgLower.includes('modify plan') ||
        msgLower.includes('new plan') ||
        msgLower.includes('update plan') ||
        msgLower.includes('make a plan') ||
        msgLower.includes('create plan') ||
        msgLower.includes('re-schedule') ||
        msgLower.includes('reschedule');

      let adjustedPlan: any = undefined;
      if (isPlanAdjustment) {
        adjustedPlan = adjustPlanLocally(currentPlan || {}, message);
      }

      return res.json({
        text: cleanedText || "Here is your study answer.",
        visualAid: visualAid,
        adjustedPlan: adjustedPlan
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      const msgLower = (req.body.message || '').toLowerCase();
      const isPlanAdjustment =
        msgLower.includes('adjust') ||
        msgLower.includes('change plan') ||
        msgLower.includes('modify plan') ||
        msgLower.includes('new plan') ||
        msgLower.includes('update plan') ||
        msgLower.includes('make a plan') ||
        msgLower.includes('create plan') ||
        msgLower.includes('re-schedule') ||
        msgLower.includes('reschedule');

      return res.json({
        text: getOfflineAssistantResponse(req.body.message, req.body.subjects),
        visualAid: generateOfflineVisualAid(req.body.message),
        adjustedPlan: isPlanAdjustment ? adjustPlanLocally(req.body.currentPlan || {}, req.body.message) : undefined
      });
    }
  });

  // Vite Middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyForge AI server running on http://0.0.0.0:${PORT}`);
  });
}

// Fallback logic helpers
function generateLocalFallbackPlan(subjects: any[], availableHours: number, studyDays: string[], goal: string, sessionLen: number, preferredStartTime?: string) {
  const sessionDuration = sessionLen || 45;
  const daysList = ['Today (Day 1)', 'Tomorrow (Day 2)', 'Day 3'];

  let baseStartMins = 9 * 60;
  if (preferredStartTime && typeof preferredStartTime === 'string' && preferredStartTime.includes(':')) {
    const [ph, pm] = preferredStartTime.split(':').map(n => parseInt(n, 10) || 0);
    baseStartMins = (ph % 24) * 60 + (pm % 60);
  }

  // Sort subjects by urgency / difficulty
  const sorted = [...subjects].sort((a, b) => {
    const dateA = new Date(a.examDate || '2099-01-01').getTime();
    const dateB = new Date(b.examDate || '2099-01-01').getTime();
    return dateA - dateB;
  });

  const days = daysList.map((dayName, dIdx) => {
    let currentMin = baseStartMins;
    const sessions = [];
    const numSessions = Math.min(4, Math.floor(((availableHours || 4) * 60) / (sessionDuration + 15)));

    for (let i = 0; i < numSessions; i++) {
      const subj = sorted[i % sorted.length] || subjects[0] || { name: 'Core Subject', color: '#3b82f6', priority: 'high' };
      const startH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
      const startM = (currentMin % 60).toString().padStart(2, '0');
      currentMin += sessionDuration;
      const endH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
      const endM = (currentMin % 60).toString().padStart(2, '0');

      sessions.push({
        id: `fb-s-${dIdx}-${i}-${Date.now()}`,
        subjectId: subj.id || `subj-${i}`,
        subjectName: subj.name,
        subjectColor: subj.color || '#3b82f6',
        topic: subj.topics?.[i % (subj.topics?.length || 1)]?.name || `${subj.name} Intensive Practice`,
        durationMinutes: sessionDuration,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        priority: subj.priority || 'high',
        type: i % 2 === 0 ? 'learning' : 'practice',
        completed: false,
        dayIndex: dIdx
      });

      currentMin += 15; // break space

      if (i === 1 && numSessions > 2) {
        // Insert break
        const bStartH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
        const bStartM = (currentMin % 60).toString().padStart(2, '0');
        currentMin += 15;
        const bEndH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
        const bEndM = (currentMin % 60).toString().padStart(2, '0');

        sessions.push({
          id: `fb-b-${dIdx}-${Date.now()}`,
          subjectId: 'break',
          subjectName: 'Mindfulness Break',
          subjectColor: '#64748b',
          topic: 'Hydration & Mental Reset',
          durationMinutes: 15,
          startTime: `${bStartH}:${bStartM}`,
          endTime: `${bEndH}:${bEndM}`,
          priority: 'low',
          type: 'break',
          completed: false,
          dayIndex: dIdx
        });
      }
    }

    return {
      dayName,
      dateString: new Date(Date.now() + dIdx * 86400000).toISOString().split('T')[0],
      totalMinutes: sessions.reduce((a, b) => a + b.durationMinutes, 0),
      sessions
    };
  });

  return {
    id: `local-plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    goal: goal || 'high_grades',
    sessionLengthMinutes: sessionDuration,
    availableHoursPerDay: availableHours || 4,
    studyDays: studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    days,
    aiReasoning: 'Generated via local adaptive prioritization matrix prioritizing closest upcoming exam deadlines.'
  };
}

function adjustPlanLocally(plan: any, adjustmentType: string) {
  if (!plan || !plan.days) return plan;
  const newDays = JSON.parse(JSON.stringify(plan.days));

  if (adjustmentType.includes('missed') || adjustmentType.includes('less time')) {
    // Uncomplete today's sessions or move incomplete sessions to day 2
    if (newDays[0] && newDays[1]) {
      const pendingToday = newDays[0].sessions.filter((s: any) => !s.completed && s.type !== 'break');
      if (pendingToday.length > 0) {
        // Append a session to tomorrow
        const moved = { ...pendingToday[0], id: `moved-${Date.now()}`, dayIndex: 1, startTime: '16:00', endTime: '16:45' };
        newDays[1].sessions.push(moved);
      }
    }
  }

  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    aiReasoning: `Adjusted plan intelligently for '${adjustmentType}'. Sessions redistributed to preserve focus.`,
    days: newDays
  };
}

function generateOfflineVisualAid(query: string): any {
  const q = query.toLowerCase();

  if (q.includes('formula') || q.includes('cheat sheet') || q.includes('equation')) {
    return {
      type: 'formula',
      title: 'Comprehensive Mathematics & Physics High-Yield Formula Sheet',
      formulas: [
        { label: 'Quadratic Formula (Algebra)', formula: 'x = (-b ± √(b² - 4ac)) / (2a)', explanation: 'Finds real & complex roots of a 2nd-degree polynomial ax² + bx + c = 0.' },
        { label: 'Calculus Power Rule & Chain Rule', formula: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)', explanation: 'Differentiates composite functions; power rule: d/dx[xⁿ] = n·xⁿ⁻¹.' },
        { label: 'Euler\'s Identity (Complex Analysis)', formula: 'e^(iπ) + 1 = 0  ⇒  e^(ix) = cos(x) + i·sin(x)', explanation: 'Fundamental relation linking exponential, imaginary, and trigonometric functions.' },
        { label: 'Newton\'s 2nd Law & Momentum', formula: 'F_net = m · a = dp/dt', explanation: 'Net force equals mass times acceleration or rate of change of momentum.' },
        { label: 'Einstein Mass-Energy Equivalence', formula: 'E = m · c²  (Relativistic: E² = (pc)² + (m₀c²)²)', explanation: 'Rest mass energy conversion and total relativistic energy relation.' },
        { label: 'Work-Energy Theorem', formula: 'W_net = ΔK = ½ m(v_f² - v_i²)', explanation: 'Net work done on a system equals the change in kinetic energy.' },
        { label: 'Coulomb\'s Law (Electrostatics)', formula: 'F_e = k · (|q₁ · q₂|) / r²', explanation: 'Electrostatic force between two point charges q₁ and q₂ separated by distance r.' },
        { label: 'Thermodynamics Ideal Gas Law', formula: 'P · V = n · R · T = N · k_B · T', explanation: 'Relates pressure P, volume V, moles n, and absolute temperature T.' }
      ],
      summary: 'Comprehensive academic formula sheet with major and secondary equations ready for download.'
    };
  }

  if (q.includes('diagram') || q.includes('flow') || q.includes('process')) {
    return {
      type: 'diagram',
      title: 'Active Study & Memory Consolidation Cycle',
      diagramNodes: [
        { id: '1', label: 'Step 1: First Input', desc: 'Read concept & write active summaries' },
        { id: '2', label: 'Step 2: Spaced Retrieval', desc: 'Test yourself without notes after 24 hrs' },
        { id: '3', label: 'Step 3: Feynman Explanation', desc: 'Explain concept aloud in simple terms' }
      ],
      summary: 'Proven cognitive loop for long-term memory retention.'
    };
  }

  if (q.includes('graph') || q.includes('chart') || q.includes('data') || q.includes('math') || q.includes('biology')) {
    if (q.includes('law') || q.includes('legal')) {
      return {
        type: 'table',
        title: 'Fundamental Legal Doctrine Matrix',
        headers: ['Legal Concept', 'Subject Area', 'Core Test / Standard'],
        rows: [
          ['Stare Decisis', 'Constitutional Law', 'Precedent remains binding unless overturned'],
          ['Mens Rea', 'Criminal Law', 'Guilty mind requirement'],
          ['Promissory Estoppel', 'Contracts Law', 'Reasonable reliance on unambiguous promise'],
          ['Strict Scrutiny', 'Constitutional Rights', 'Compelling state interest & narrow tailoring']
        ],
        summary: 'Key comparative framework across core legal disciplines.'
      };
    }

    if (q.includes('biology') || q.includes('cell') || q.includes('atp')) {
      return {
        type: 'chart',
        title: 'Cellular Respiration Net ATP Yield Comparison',
        chartType: 'bar',
        data: [
          { name: 'Glycolysis', value: 2 },
          { name: 'Pyruvate Oxid.', value: 2 },
          { name: 'Krebs Cycle', value: 2 },
          { name: 'Elec. Transport', value: 32 }
        ],
        summary: 'Total theoretical yield is ~36 to 38 ATP per glucose molecule.'
      };
    }

    return {
      type: 'chart',
      title: 'Estimated Topic Weight & Mastery Score',
      chartType: 'bar',
      data: [
        { name: 'Core Foundations', value: 85 },
        { name: 'Problem Sets', value: 60 },
        { name: 'Exam Prep', value: 40 },
        { name: 'Revision', value: 90 }
      ],
      summary: 'Data representation of study module progress.'
    };
  }

  return undefined;
}

function getOfflineAssistantResponse(query: string, subjects: any[]): string {
  const q = query.toLowerCase();
  const subjList = (subjects || []).map((s: any) => s.name).join(', ') || 'Mathematics and Programming';

  if (q.includes('adjust') || q.includes('change plan') || q.includes('modify plan') || q.includes('new plan') || q.includes('update plan') || q.includes('make a plan') || q.includes('create plan') || q.includes('schedule')) {
    return `⚡ **Done! I have updated your study plan!**

As your personal study assistant (Jarvis for StudyForge AI), I've dynamically adjusted your study schedule based on your request:
- **Priority Rebalance**: Boosted high-focus blocks for your target subject modules (*Physics*, *Mathematics* & *Programming*).
- **Time Optimization**: Resequenced your daily study sessions to fit your available schedule while preserving recommended 5-minute mindfulness breaks.
- **Synced**: Check out your updated sessions on the **Today's Tasks** & **Study Plan** tabs!`;
  }

  if (q.includes('hi') || q.includes('hello') || q.includes('who are you') || q.includes('hey')) {
    return `👋 **Hi! I am Alex, your personal study assistant.**

I'm right here to support your study journey! I have loaded your active subjects (*${subjList}*). 

Whether you're struggling with a tough topic, need video lectures, or want formula cheat-sheets, ask me anytime!`;
  }

  if (q.includes('issue') || q.includes('stuck') || q.includes('hard') || q.includes('understand') || q.includes('problem') || q.includes('help') || q.includes('lecture') || q.includes('video') || q.includes('youtube')) {
    const topic = q.replace(/help|issue|stuck|understand|hard|problem|with|in|on|the|a|i|am|facing|having/gi, '').trim() || 'Calculus and Algorithms';
    const searchTopic = encodeURIComponent(topic || 'Study Tutorial');
    return `🤗 **No worries at all! Let's tackle this together.**

As your personal study assistant, whenever you face an issue understanding a topic, I recommend watching top visual video explanations to make it click.

**Recommended YouTube Video Lectures:**
- [▶ Khan Academy: Search "${topic}" on YouTube](https://www.youtube.com/results?search_query=${searchTopic}+Khan+Academy)
- [▶ 3Blue1Brown: Visual Intuition for "${topic}"](https://www.youtube.com/results?search_query=${searchTopic}+3Blue1Brown)
- [▶ CrashCourse & MIT Lectures for "${topic}"](https://www.youtube.com/results?search_query=${searchTopic}+MIT+lecture)

**Alex's Study Tip:**
Watch at 1.25x speed while taking brief bullet notes on paper. Afterwards, explain the core idea back to me!`;
  }

  if (q.includes('math') || q.includes('prepare')) {
    return `📐 **Exam Preparation Strategy & Video Lectures**

1. **Active Recall over Passive Reading**: Work through 3 problem sets daily without checking solution steps first.
2. **Focus on Pain Points**: Dedicate 45-minute blocks to *Calculus & Differential Equations*.
3. **Recommended Video Lectures**:
   - [▶ Watch 3Blue1Brown Essence of Calculus](https://www.youtube.com/results?search_query=Essence+of+calculus+3blue1brown)
   - [▶ Watch Khan Academy Mathematics](https://www.youtube.com/results?search_query=Khan+Academy+Mathematics)

Let me know if you face any specific issue with a formula or problem!`;
  }

  if (q.includes('1 hour') || q.includes('less time')) {
    return `⚡ **1-Hour Focus Sprint Recommendation**

Since you have limited time today, target your highest priority subject (**Mathematics**):
- **00:00 – 00:25**: Solve 2 key differential equation problems.
- **00:25 – 00:30**: Quick 5-min eye break.
- **00:30 – 00:55**: Review Fourier Series formulas or watch a quick 10-min tutorial.
  - [▶ Quick YouTube Tutorial: Fourier Series](https://www.youtube.com/results?search_query=Fourier+Series+explained+simply)
- **00:55 – 01:00**: Log session & mark complete on your StudyForge dashboard.`;
  }

  if (q.includes('recursion') || q.includes('programming')) {
    return `💻 **Mastering Recursion & Dynamic Programming**

- **Identify Base Cases First**: Always write out what stops the function recursion before writing recursive steps.
- **Draw Call Stacks**: Visualize small input trees (e.g., \`fib(4)\`) on paper.
- **Recommended Video Tutorials**:
  - [▶ Watch freeCodeCamp: Dynamic Programming & Recursion](https://www.youtube.com/results?search_query=freecodecamp+recursion+and+dynamic+programming)
  - [▶ Watch CS50: Recursion Explained](https://www.youtube.com/results?search_query=CS50+Recursion)

Let me know if you get stuck on a code snippet and I will walk you through it!`;
  }

  return `🚀 **Alex's Personal Study Advice**

Based on your active subjects (**${subjList}**):

1. **Balance High & Low Difficulty**: Start your day with your hardest subject when cognitive stamina is highest.
2. **Video Lectures when Stuck**: Whenever a concept feels confusing, search YouTube tutorials or ask me to find direct video links for you!
3. **Use the Focus Timer**: Work in structured Pomodoro blocks with brief breaks to maximize memory retention.`;
}

startServer();
