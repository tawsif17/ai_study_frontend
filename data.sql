--
-- PostgreSQL database dump
--

\restrict IXKLIQY4eDGsVXuGmEfQlVgxmJPcHO34CFgGktn336vOOYapf7M3c1r1weldf3O

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: exam_types; Type: TABLE DATA; Schema: public; Owner: startup
--

INSERT INTO public.exam_types (id, code, name, is_active, created_at, updated_at) VALUES (1, 'SSC', 'Secondary School Examination (SSC)', true, '2026-01-11 07:31:44.590909+06', '2026-01-13 00:00:51.021727+06');


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: startup
--

INSERT INTO public.subjects (id, exam_type_id, name, is_active, created_at, updated_at) VALUES (1, 1, 'General Mathematics', true, '2026-01-11 07:54:32.920722+06', '2026-01-11 07:54:32.920722+06');
INSERT INTO public.subjects (id, exam_type_id, name, is_active, created_at, updated_at) VALUES (2, 1, 'Physics', true, '2026-01-11 07:54:39.84852+06', '2026-01-11 07:54:39.84852+06');
INSERT INTO public.subjects (id, exam_type_id, name, is_active, created_at, updated_at) VALUES (3, 1, 'Chemistry', true, '2026-01-11 07:54:46.419632+06', '2026-01-11 07:54:46.419632+06');


--
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: startup
--

INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (1, 1, 'Real Numbers', 1, '2026-01-11 07:56:00.719662+06', '2026-01-11 07:56:00.719662+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (2, 1, 'Sets and Functions', 2, '2026-01-11 07:56:12.67399+06', '2026-01-11 07:57:07.053386+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (3, 3, 'Concept of Chemistry', 1, '2026-01-12 17:13:03.454419+06', '2026-01-12 17:13:03.454419+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (4, 3, 'States of Matter', 2, '2026-01-12 17:13:38.595776+06', '2026-01-12 17:13:38.595776+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (5, 3, 'Structure of Matter', 3, '2026-01-12 17:14:04.697915+06', '2026-01-12 17:14:04.697915+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (6, 3, 'Periodic table', 4, '2026-01-12 17:14:36.556751+06', '2026-01-12 17:14:36.556751+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (7, 3, 'Chemical Bond', 5, '2026-01-12 17:15:26.442508+06', '2026-01-12 17:15:26.442508+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (8, 3, 'Concept of mole and chemical calculations', 6, '2026-01-12 17:16:38.873419+06', '2026-01-12 17:16:38.873419+06');
INSERT INTO public.chapters (id, subject_id, chapter_name, order_no, created_at, updated_at) VALUES (9, 3, 'Chemical Reactions', 7, '2026-01-12 17:17:38.480833+06', '2026-01-12 17:17:38.480833+06');


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: syllabus_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.syllabus_versions (id, exam_type_id, code, effective_from, effective_to, is_current, created_at, updated_at) VALUES ('eb78da24-9def-4b7b-9e52-7c69e3490022', 1, 'SSC_2025', '2025-01-01', NULL, true, '2026-01-11 08:06:18.348454+06', '2026-01-11 08:06:18.348454+06');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: startup
--

INSERT INTO public.users (id, email, password_hash, full_name, role, plan_tier, last_login_at, created_at, updated_at, school, city, student_class) VALUES ('0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 'tawsif@gmail.com', '$2b$10$79Vce9Hi.gcPnM6QImU3/O70D/7nPJYJ60wMLvKOWU4.E1eGE1lbC', 'Tawsif', 'user', 'free', '2026-02-11 14:30:18.676016+06', '2026-01-14 07:29:26.551393+06', '2026-02-11 14:30:18.676016+06', 'CESC', 'Chattagram', 9);


--
-- Data for Name: practice_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (14, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'FULL_SYLLABUS', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 'MIXED', 10, 4, 'IN_PROGRESS', '2026-01-19 23:04:57.447175+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (15, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'FULL_SYLLABUS', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 'MIXED', 10, 4, 'SUBMITTED', '2026-01-21 16:20:35.74936+06', '2026-01-25 08:59:08.150306+06', 10, 0, 0);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (16, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-28 18:49:46.350407+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (17, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-28 18:53:40.633609+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (18, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-28 18:54:37.712957+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (19, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-28 18:57:00.798739+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (20, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:15:14.622803+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (21, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:17:07.023365+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (22, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:17:39.572903+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (23, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:26:28.760933+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (24, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:28:21.17404+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (25, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'IN_PROGRESS', '2026-01-29 07:30:16.484456+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (26, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 07:31:59.500235+06', '2026-01-29 07:36:42.751091+06', 6, 0, 0);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (27, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 07:39:36.358711+06', '2026-01-29 07:39:44.62848+06', 10, 0, 0);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (28, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 07:43:20.069336+06', '2026-01-29 07:43:28.121224+06', 10, 1, 1);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (29, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'FULL_SYLLABUS', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 'MCQ', 5, 0, 'IN_PROGRESS', '2026-01-29 07:48:50.651447+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (30, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 07:50:23.847989+06', '2026-01-29 07:50:33.564359+06', 10, 1, 1);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (31, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'CQ', 0, 2, 'SUBMITTED', '2026-01-29 07:51:04.287166+06', '2026-01-29 07:54:12.442415+06', 0, 0, 0);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (32, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 17:30:14.707896+06', '2026-01-29 17:30:24.552738+06', 3, 0, 0);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (33, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 20, 0, 'SUBMITTED', '2026-01-29 17:30:40.059279+06', '2026-01-29 17:31:22.720118+06', 10, 3, 3);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (34, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-01-29 17:39:49.130621+06', '2026-01-29 17:40:21.418359+06', 10, 1, 1);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (35, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'CQ', 0, 2, 'IN_PROGRESS', '2026-01-29 17:40:44.020684+06', NULL, NULL, NULL, NULL);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (36, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MCQ', 10, 0, 'SUBMITTED', '2026-02-01 13:27:24.904507+06', '2026-02-01 13:27:43.297059+06', 10, 1, 1);
INSERT INTO public.practice_sessions (id, user_id, exam_type_id, subject_id, selection_mode, syllabus_version_id, mode, mcq_requested, cq_requested, attempt_status, created_at, submitted_at, mcq_total, mcq_correct, mcq_score) VALUES (37, '0f0ac14f-2dd6-4690-a086-37a7b71f55f0', 1, 3, 'CHAPTERS', NULL, 'MIXED', 10, 3, 'SUBMITTED', '2026-02-11 14:30:47.602246+06', '2026-02-11 14:31:13.313294+06', 10, 3, 3);


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (3, 1, 3, 8, 'CREATIVE', 'For preparing 10.6 g of Na₂CO₃, 6.3 g of Na₂O and 4.3 g of CO₂ are mixed.', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:31:19.940222+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (8, 1, 3, 6, 'MCQ', 'What is the oxidation number of sulphur in H₂S₂O₇?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (9, 1, 3, 6, 'MCQ', 'What is the percentage of kerosene oil in petroleum?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (10, 1, 3, 5, 'MCQ', 'The time of diffusion of which gas will be more?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (11, 1, 3, 9, 'MCQ', 'Which of the following elements has the least electron affinity?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (12, 1, 3, 4, 'MCQ', 'Which compound can decolorize bromine solution?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (13, 1, 3, 5, 'MCQ', 'Which is Planck’s constant (m² kg s⁻¹)?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (14, 1, 3, 3, 'MCQ', 'Which is a sublimated substance?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (1, 1, 3, 8, 'CREATIVE', 'The gases CO₂, N₂ and SO₂ are kept in three balloons marked as A, B and C respectively.', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:31:19.940222+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (22, 1, 3, 3, 'MCQ', 'MCQ stem 1', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (23, 1, 3, 4, 'MCQ', 'MCQ stem 2', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (24, 1, 3, 6, 'MCQ', 'MCQ stem 3', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (25, 1, 3, 5, 'MCQ', 'MCQ stem 4', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (26, 1, 3, 7, 'MCQ', 'MCQ stem 5', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (27, 1, 3, 9, 'CREATIVE', 'CQ stem 1', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (28, 1, 3, 9, 'CREATIVE', 'CQ stem 2', NULL, NULL, 'PUBLISHED', 'bn', NULL, '2026-01-18 10:42:55.329574+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (2, 1, 3, 5, 'CREATIVE', 'Elements X, Y and Z have atomic numbers 17, 19 and 21 respectively. [Here X, Y and Z are symbolic.]', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:31:19.940222+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (5, 1, 3, 5, 'MCQ', 'How many isotopes does hydrogen have?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (6, 1, 3, 4, 'MCQ', 'Which of the following is a reductant substance?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');
INSERT INTO public.questions (id, exam_type_id, subject_id, chapter_id, question_type, stem_text, difficulty, source, status, language, explanation, created_at, updated_at) VALUES (7, 1, 3, 9, 'MCQ', 'Which one is a positive radical?', NULL, 'Internal', 'PUBLISHED', 'en', NULL, '2026-01-12 22:38:50.738047+06', '2026-01-19 16:02:26.315615+06');


--
-- Data for Name: practice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (32, 14, 11, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (33, 14, 13, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (34, 14, 9, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (35, 14, 14, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (36, 14, 5, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (37, 14, 12, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (38, 14, 8, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (39, 14, 10, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (40, 14, 7, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (41, 14, 6, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (42, 14, 2, 'CQ', 11, 2, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (43, 14, 3, 'CQ', 12, 2, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (44, 14, 1, 'CQ', 13, 2, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (45, 15, 7, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (46, 15, 10, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (47, 15, 14, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (48, 15, 12, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (49, 15, 11, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (50, 15, 9, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (51, 15, 6, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (52, 15, 8, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (53, 15, 5, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (54, 15, 13, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (55, 15, 1, 'CQ', 11, 2, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (56, 15, 3, 'CQ', 12, 2, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (57, 15, 2, 'CQ', 13, 2, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (58, 16, 11, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (59, 16, 12, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (60, 16, 14, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (61, 16, 7, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (62, 16, 5, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (63, 16, 9, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (64, 16, 10, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (65, 16, 13, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (66, 16, 8, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (67, 16, 6, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (68, 17, 9, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (69, 17, 11, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (70, 17, 12, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (71, 17, 10, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (72, 17, 6, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (73, 17, 5, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (74, 17, 14, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (75, 17, 7, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (76, 17, 13, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (77, 17, 8, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (78, 18, 12, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (79, 18, 13, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (80, 18, 5, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (81, 18, 10, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (82, 18, 9, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (83, 18, 14, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (84, 18, 11, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (85, 18, 7, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (86, 18, 6, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (87, 18, 8, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (88, 19, 14, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (89, 19, 8, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (90, 19, 11, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (91, 19, 5, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (92, 19, 10, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (93, 19, 6, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (94, 19, 13, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (95, 19, 12, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (96, 19, 7, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (97, 19, 9, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (98, 20, 10, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (99, 20, 7, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (100, 20, 12, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (101, 20, 8, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (102, 20, 14, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (103, 20, 11, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (104, 20, 5, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (105, 20, 6, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (106, 20, 9, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (107, 20, 13, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (108, 21, 11, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (109, 21, 5, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (110, 21, 10, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (111, 21, 14, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (112, 21, 12, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (113, 21, 7, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (114, 21, 9, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (115, 21, 6, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (116, 21, 13, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (117, 21, 8, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (118, 22, 8, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (119, 22, 7, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (120, 22, 14, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (121, 22, 11, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (122, 22, 6, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (123, 22, 9, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (124, 22, 10, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (125, 22, 12, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (126, 22, 13, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (127, 22, 5, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (128, 23, 9, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (129, 23, 12, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (130, 23, 5, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (131, 23, 13, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (132, 23, 6, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (133, 23, 10, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (134, 23, 8, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (135, 23, 11, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (136, 23, 14, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (137, 23, 7, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (138, 24, 5, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (139, 24, 10, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (140, 24, 6, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (141, 24, 7, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (142, 24, 9, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (143, 24, 12, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (144, 24, 13, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (145, 24, 11, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (146, 24, 14, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (147, 24, 8, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (148, 25, 12, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (149, 25, 6, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (150, 25, 11, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (151, 25, 14, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (152, 25, 13, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (153, 25, 9, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (154, 25, 8, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (155, 25, 5, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (156, 25, 7, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (157, 25, 10, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (158, 26, 12, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (159, 26, 5, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (160, 26, 14, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (161, 26, 10, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (162, 26, 13, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (163, 26, 6, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (164, 27, 13, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (165, 27, 8, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (166, 27, 11, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (167, 27, 10, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (168, 27, 14, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (169, 27, 9, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (170, 27, 7, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (171, 27, 5, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (172, 27, 12, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (173, 27, 6, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (174, 28, 12, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (175, 28, 7, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (176, 28, 5, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (177, 28, 8, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (178, 28, 9, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (179, 28, 6, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (180, 28, 13, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (181, 28, 14, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (182, 28, 10, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (183, 28, 11, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (184, 29, 6, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (185, 29, 5, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (186, 29, 13, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (187, 29, 8, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (188, 29, 14, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (189, 30, 9, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (190, 30, 14, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (191, 30, 6, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (192, 30, 5, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (193, 30, 13, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (194, 30, 10, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (195, 30, 8, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (196, 30, 12, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (197, 30, 7, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (198, 30, 11, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (199, 31, 2, 'CQ', 1, 2, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (200, 31, 3, 'CQ', 2, 2, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (201, 32, 12, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (202, 32, 14, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (203, 32, 6, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (204, 33, 11, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (205, 33, 8, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (206, 33, 7, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (207, 33, 13, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (208, 33, 10, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (209, 33, 6, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (210, 33, 14, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (211, 33, 5, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (212, 33, 12, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (213, 33, 9, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (214, 34, 14, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (215, 34, 9, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (216, 34, 6, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (217, 34, 12, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (218, 34, 7, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (219, 34, 11, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (220, 34, 10, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (221, 34, 13, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (222, 34, 8, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (223, 34, 5, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (224, 35, 1, 'CQ', 1, 2, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (225, 35, 2, 'CQ', 2, 2, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (226, 36, 8, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (227, 36, 5, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (228, 36, 12, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (229, 36, 9, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (230, 36, 6, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (231, 36, 14, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (232, 36, 11, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (233, 36, 13, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (234, 36, 7, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (235, 36, 10, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (236, 37, 8, 'MCQ', 1, 1, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (237, 37, 13, 'MCQ', 2, 1, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (238, 37, 9, 'MCQ', 3, 1, 3);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (239, 37, 11, 'MCQ', 4, 1, 4);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (240, 37, 6, 'MCQ', 5, 1, 5);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (241, 37, 7, 'MCQ', 6, 1, 6);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (242, 37, 5, 'MCQ', 7, 1, 7);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (243, 37, 14, 'MCQ', 8, 1, 8);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (244, 37, 10, 'MCQ', 9, 1, 9);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (245, 37, 12, 'MCQ', 10, 1, 10);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (246, 37, 2, 'CQ', 11, 2, 1);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (247, 37, 1, 'CQ', 12, 2, 2);
INSERT INTO public.practice_items (id, practice_session_id, question_id, section, order_no, section_number, section_order_no) VALUES (248, 37, 3, 'CQ', 13, 2, 3);


--
-- Data for Name: practice_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (72, 34, 214, 'MCQ', 'B', NULL, '2026-01-29 17:40:21.418359+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (73, 34, 216, 'MCQ', 'A', NULL, '2026-01-29 17:40:21.418359+06', true, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (74, 34, 221, 'MCQ', 'B', NULL, '2026-01-29 17:40:21.418359+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (75, 34, 223, 'MCQ', 'C', NULL, '2026-01-29 17:40:21.418359+06', false, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (17, 15, 57, 'CQ', NULL, 'This is my written answer', '2026-01-25 08:58:35.311979+06', NULL, NULL);
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (15, 15, 47, 'MCQ', 'B', NULL, '2026-01-25 08:59:08.150306+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (16, 15, 48, 'MCQ', 'A', NULL, '2026-01-25 08:59:08.150306+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (18, 26, 158, 'MCQ', 'A', NULL, '2026-01-29 07:36:42.751091+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (19, 26, 159, 'MCQ', 'C', NULL, '2026-01-29 07:36:42.751091+06', false, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (21, 26, 160, 'MCQ', 'C', NULL, '2026-01-29 07:36:42.751091+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (22, 27, 164, 'MCQ', 'C', NULL, '2026-01-29 07:39:44.62848+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (23, 27, 165, 'MCQ', 'C', NULL, '2026-01-29 07:39:44.62848+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (24, 28, 174, 'MCQ', 'A', NULL, '2026-01-29 07:43:28.121224+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (25, 28, 180, 'MCQ', 'D', NULL, '2026-01-29 07:43:28.121224+06', true, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (26, 28, 183, 'MCQ', 'D', NULL, '2026-01-29 07:43:28.121224+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (27, 30, 189, 'MCQ', 'C', NULL, '2026-01-29 07:50:33.564359+06', false, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (28, 30, 194, 'MCQ', 'C', NULL, '2026-01-29 07:50:33.564359+06', true, 'C');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (29, 30, 195, 'MCQ', 'B', NULL, '2026-01-29 07:50:33.564359+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (30, 30, 196, 'MCQ', 'C', NULL, '2026-01-29 07:50:33.564359+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (76, 36, 226, 'MCQ', 'B', NULL, '2026-02-01 13:27:43.297059+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (77, 36, 227, 'MCQ', 'B', NULL, '2026-02-01 13:27:43.297059+06', true, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (78, 36, 231, 'MCQ', 'B', NULL, '2026-02-01 13:27:43.297059+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (79, 36, 233, 'MCQ', 'C', NULL, '2026-02-01 13:27:43.297059+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (80, 36, 235, 'MCQ', 'B', NULL, '2026-02-01 13:27:43.297059+06', false, 'C');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (81, 37, 236, 'MCQ', 'A', NULL, '2026-02-11 14:31:13.313294+06', true, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (82, 37, 237, 'MCQ', 'B', NULL, '2026-02-11 14:31:13.313294+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (83, 37, 238, 'MCQ', 'B', NULL, '2026-02-11 14:31:13.313294+06', true, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (84, 37, 242, 'MCQ', 'B', NULL, '2026-02-11 14:31:13.313294+06', true, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (85, 37, 243, 'MCQ', 'C', NULL, '2026-02-11 14:31:13.313294+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (86, 37, 245, 'MCQ', 'C', NULL, '2026-02-11 14:31:13.313294+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (31, 31, 199, 'CQ', NULL, 'Hello I am writing CQ', '2026-01-29 07:54:05.735333+06', NULL, NULL);
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (54, 31, 200, 'CQ', NULL, 'Hiiii', '2026-01-29 07:54:10.337716+06', NULL, NULL);
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (59, 32, 201, 'MCQ', 'B', NULL, '2026-01-29 17:30:24.552738+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (60, 32, 202, 'MCQ', 'A', NULL, '2026-01-29 17:30:24.552738+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (61, 32, 203, 'MCQ', 'C', NULL, '2026-01-29 17:30:24.552738+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (62, 33, 204, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (63, 33, 205, 'MCQ', 'B', NULL, '2026-01-29 17:31:22.720118+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (64, 33, 206, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', true, 'C');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (65, 33, 207, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (66, 33, 208, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', true, 'C');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (67, 33, 209, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', false, 'A');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (68, 33, 210, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (69, 33, 211, 'MCQ', 'D', NULL, '2026-01-29 17:31:22.720118+06', false, 'B');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (70, 33, 212, 'MCQ', 'C', NULL, '2026-01-29 17:31:22.720118+06', false, 'D');
INSERT INTO public.practice_answers (id, practice_session_id, practice_item_id, answer_type, selected_option_label, cq_text, updated_at, is_correct, correct_option_label) VALUES (71, 33, 213, 'MCQ', 'B', NULL, '2026-01-29 17:31:22.720118+06', true, 'B');


--
-- Data for Name: practice_session_chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (14, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (15, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (16, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (17, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (18, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (19, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (20, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (21, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (22, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (23, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (24, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (25, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (26, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (26, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (26, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (27, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (28, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (29, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (30, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (31, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (32, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (32, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (33, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (34, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (35, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (36, 9, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 3, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 4, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 5, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 6, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 7, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 8, 3);
INSERT INTO public.practice_session_chapters (practice_session_id, chapter_id, subject_id) VALUES (37, 9, 3);


--
-- Data for Name: question_mcq_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (2, 5, 'A', '1', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (3, 5, 'B', '3', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (4, 5, 'C', '4', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (5, 5, 'D', '7', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (6, 6, 'A', 'Fe²⁺', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (7, 6, 'B', 'Mg²⁺', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (8, 6, 'C', 'Zn²⁺', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (9, 6, 'D', 'Cu²⁺', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (10, 7, 'A', 'Phosphate', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (11, 7, 'B', 'Carbonate', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (12, 7, 'C', 'Phosphonium', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (13, 7, 'D', 'Nitrate', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (14, 8, 'A', '+6', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (15, 8, 'B', '−6', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (16, 8, 'C', '+12', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (17, 8, 'D', '−12', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (18, 9, 'A', '5%', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (19, 9, 'B', '10%', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (20, 9, 'C', '13%', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (21, 9, 'D', '20%', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (22, 10, 'A', 'Hydrogen', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (23, 10, 'B', 'Ethane', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (24, 10, 'C', 'Carbon dioxide', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (25, 10, 'D', 'Nitric oxide', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (26, 11, 'A', 'Be', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (27, 11, 'B', 'Ra', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (28, 11, 'C', 'Sr', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (29, 11, 'D', 'Mg', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (30, 12, 'A', 'C₂H₆', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (31, 12, 'B', 'C₃H₈O', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (32, 12, 'C', 'C₃H₈', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (33, 12, 'D', 'C₃H₆', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (34, 13, 'A', '6.023 × 10²³', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (35, 13, 'B', '1.673 × 10⁻²⁴', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (36, 13, 'C', '9.11 × 10⁻³¹', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (37, 13, 'D', '6.626 × 10⁻³⁴', true);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (38, 14, 'A', 'SiO₂', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (39, 14, 'B', 'C₂₀H₄₂', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (40, 14, 'C', 'Br₂', false);
INSERT INTO public.question_mcq_options (id, question_id, label, option_text, is_correct) VALUES (41, 14, 'D', 'C₁₀H₈', true);


--
-- Data for Name: question_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (1, 1, 'a', 1, 'What is hydrocarbon?', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (2, 1, 'b', 2, 'Why is ammonium chloride a sublime substance?', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (3, 1, 'c', 3, 'Calculate the number of bond pair electrons of gas B.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (4, 1, 'd', 4, 'Analyze the causes of the descending order of the rate of diffusion of gases A, B and C.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (5, 2, 'a', 1, 'What is isotope?', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (6, 2, 'b', 2, '“The whole mass of an atom is confined at the center of the nucleus”—explain.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (7, 2, 'c', 3, 'Determine the mass of 50 atoms of the first element of the stem if its relative atomic mass is 35.5.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (8, 2, 'd', 4, 'Analyze why the last electron of element Z enters the d-orbital but that of Y does not.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (9, 3, 'a', 1, 'What is isomerization reaction?', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (10, 3, 'b', 2, 'In the reaction Mg + CuSO₄ → MgSO₄ + Cu, sulphate ion is a spectator ion—explain.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (11, 3, 'c', 3, 'Determine the molecular formula of a compound containing 17.72% nitrogen, 6.33% hydrogen and 75.94% carbon with molecular mass 79.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');
INSERT INTO public.question_parts (id, question_id, label, order_no, prompt_text, marks, sample_answer, explanation, reference_text, created_at, updated_at) VALUES (12, 3, 'd', 4, 'Analyze mathematically whether the expected amount of product can be obtained from the reaction in the stem.', 0.00, NULL, NULL, NULL, '2026-01-12 22:31:19.940222+06', '2026-01-12 22:31:19.940222+06');


--
-- Data for Name: question_media_links; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: startup
--

INSERT INTO public.schema_migrations (filename, run_at) VALUES ('001_create_users_table.sql', '2026-02-12 01:04:26.624877+06');


--
-- Data for Name: syllabus_chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('bbdc0fc2-8698-450b-a421-4cb25ed4b5fe', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 1, 1, true, '2026-01-11 08:07:46.335793+06', '2026-01-11 08:07:46.335793+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('67555fdd-9e68-4838-bb3a-32a8ece18de6', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 1, 2, true, '2026-01-11 08:07:46.335793+06', '2026-01-11 08:07:46.335793+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('bc01a22e-62ef-4b08-a94f-5d91cc9f3df6', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 3, true, '2026-01-12 17:28:38.928191+06', '2026-01-12 17:28:38.928191+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('c478b56e-6ed9-439e-9f28-2205524a3899', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 4, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('fd2f204f-d2f8-4563-9a93-dc2e944a3f59', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 5, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('92838042-2b60-40ce-87b1-14c3386c4bc1', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 6, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('46cefb59-9b89-48fa-a83a-84db0423d698', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 7, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('04540629-da1d-42b5-86e0-25a92056cd14', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 8, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');
INSERT INTO public.syllabus_chapters (id, syllabus_version_id, subject_id, chapter_id, is_included, created_at, updated_at) VALUES ('874df90d-54d9-4ec5-8e42-979f9f25e85f', 'eb78da24-9def-4b7b-9e52-7c69e3490022', 3, 9, true, '2026-01-12 21:24:25.204917+06', '2026-01-12 21:24:25.204917+06');


--
-- Name: chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: startup
--

SELECT pg_catalog.setval('public.chapters_id_seq', 9, true);


--
-- Name: exam_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: startup
--

SELECT pg_catalog.setval('public.exam_types_id_seq', 1, true);


--
-- Name: practice_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.practice_answers_id_seq', 86, true);


--
-- Name: practice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.practice_items_id_seq', 248, true);


--
-- Name: practice_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.practice_sessions_id_seq', 37, true);


--
-- Name: question_mcq_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_mcq_options_id_seq', 41, true);


--
-- Name: question_media_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_media_links_id_seq', 1, false);


--
-- Name: question_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_parts_id_seq', 12, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 28, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: startup
--

SELECT pg_catalog.setval('public.subjects_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict IXKLIQY4eDGsVXuGmEfQlVgxmJPcHO34CFgGktn336vOOYapf7M3c1r1weldf3O

