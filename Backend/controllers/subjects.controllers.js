import { insertSubject, getAllSubject, getSubjectById, updateSubject, deleteSubject } from "../models/subject.model.js";
import { getTopicBySubject, deletTopic } from "../models/topic.model.js";
import { deleteQuestionsByTopicId } from "../models/questions.model.js";
import {
  getSessionsByTopicId,
  deleteSessionsByTopicId,
  deleteRegistrationsBySessionId,
  deleteSessionQuestionsBySessionId,
  getAttemptsBySessionId,
  deleteAnswersByAttemptId,
  deleteAttemptsBySessionId,
} from "../models/quiz.model.js";

export const postSubject = async (req, res) => {
  const name = req.body.name;
  try {
    const subject = await insertSubject(name);
    return res.status(200).json({ success: true, data: subject });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subject = await getAllSubject();
    return res.status(200).json({ success: true, data: subject });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

export const getSubById = async (req, res) => {
  const subject_id = req.params.id;
  try {
    const subject = await getSubjectById(subject_id);
    return res.status(200).json({ success: true, data: subject });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

export const upSubject = async (req, res) => {
  const name = req.body.name;
  const subject_id = req.params.id;
  try {
    const subject = await updateSubject(name, subject_id);
    return res.status(200).json({ success: true, data: subject });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

export const delSubject = async (req, res) => {
  const subject_id = req.params.id;
  try {
    const topics = await getTopicBySubject(subject_id);

    if (topics && topics.length > 0) {
      for (const topic of topics) {
        const sessions = await getSessionsByTopicId(topic.topic_id);

        for (const session of sessions) {
          const attempts = await getAttemptsBySessionId(session.id);
          for (const attempt of attempts) {
            await deleteAnswersByAttemptId(attempt.id);       // 1. quiz_answers
          }
          await deleteAttemptsBySessionId(session.id);        // 2. quiz_attempts
          await deleteSessionQuestionsBySessionId(session.id);// 3. quiz_session_questions
          await deleteRegistrationsBySessionId(session.id);   // 4. quiz_registrations
        }

        await deleteSessionsByTopicId(topic.topic_id);        // 5. quiz_sessions
        await deleteQuestionsByTopicId(topic.topic_id);       // 6. questions
        await deletTopic(topic.topic_id);                     // 7. topics
      }
    }

    const subject = await deleteSubject(subject_id);          // 8. subject
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subject and all linked data deleted successfully",
    });
  } catch (err) {
    console.error("delSubject error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};