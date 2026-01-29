# BACKEND_INTEGRATION_BRIEF.md

## Backend Overview
Base URL (dev): http://localhost:3001  
Auth: JWT  
Header: Authorization: Bearer <token>  
Content-Type: application/json  

---

## Error Format
All non-2xx responses use this shape:

{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}

---

## Public (No Auth Required)

### GET /exam-types
Response:
[
  { "id": 1, "code": "SSC", "name": "Secondary School Certificate" }
]

---

### GET /subjects?exam_type_id=1
Response:
[
  { "id": 10, "name": "Physics" }
]

---

### GET /subjects/:id/chapters
Response:
[
  { "id": 101, "chapter_name": "Motion" }
]

---

## Current Syllabus Resolution

### GET /api/syllabus/current
Query:
exam_type_id=1  
subject_id=10 (optional)

Response:
{
  "success": true,
  "data": {
    "syllabus_version": {
      "id": 1,
      "code": "SSC_2025"
    },
    "chapters": [
      {
        "id": 101,
        "chapter_name": "Motion",
        "subject_id": 10
      }
    ]
  }
}

Errors:
- 400 INVALID_EXAM_SUBJECT_PAIR
- 404 CURRENT_SYLLABUS_NOT_FOUND

---

## Public Question Bank (Read-only)

### GET /api/questions
Query (required):
exam_type_id=1  
subject_id=10  

Optional:
chapter_id=101  
question_type=MCQ|CREATIVE|SHORT  
language=bn|en  

Response:
{
  "items": [
    {
      "id": 901,
      "question_type": "MCQ",
      "chapter_id": 101,
      "difficulty": 2,
      "language": "bn"
    }
  ]
}

Notes:
- Only PUBLISHED questions are returned
- No options, parts, or media included

---

### GET /api/questions/:id
Response (MCQ):
{
  "id": 901,
  "question_type": "MCQ",
  "stem_text": "...",
  "explanation": "...",
  "language": "bn",
  "options": [
    { "label": "A", "option_text": "..." },
    { "label": "B", "option_text": "..." },
    { "label": "C", "option_text": "..." },
    { "label": "D", "option_text": "..." }
  ],
  "media": []
}

Response (CQ / SHORT):
{
  "id": 902,
  "question_type": "CREATIVE",
  "stem_text": "...",
  "language": "bn",
  "parts": [
    {
      "label": "a",
      "marks": 5,
      "sample_answer": "...",
      "explanation": "...",
      "reference_text": "..."
    }
  ],
  "media": []
}

Errors:
- 404 QUESTION_NOT_FOUND (includes non-PUBLISHED)

---

## Authentication

### POST /auth/register
Request:
{
  "name": "Student Name",
  "email": "student@email.com",
  "password": "password",
  "school": "ABC School",
  "city": "Dhaka",
  "class": 10
}

Response:
{
  "id": 1,
  "email": "student@email.com"
}

---

### POST /auth/login
Request:
{
  "email": "student@email.com",
  "password": "password"
}

Response:
{
  "token": "<jwt_token>"
}

---

## Practice Session (Auth Required)

### POST /practice/generate
Request:
{
  "exam_type_id": 1,
  "subject_id": 10,
  "selection": {
    "type": "CHAPTERS",
    "chapter_ids": [101,102]
  },
  "mode": "MCQ",
  "mcq_count": 20,
  "cq_count": 0,
  "language": "bn"
}

Response:
{
  "practice_session_id": 123,
  "mcq_total": 20,
  "cq_total": 0
}

---

### GET /practice/:id/summary
Response:
{
  "practice_session_id": 123,
  "exam_type_id": 1,
  "subject_id": 10,
  "mode": "MCQ",
  "attempt_status": "IN_PROGRESS"
}

---

## Practice Items (Paginated View)

### GET /practice/:id/items
Query:
section=MCQ|CQ  
page=1  
page_size=10  

Response:
{
  "section": "MCQ",
  "page": 1,
  "page_size": 10,
  "total_in_section": 20,
  "items": [
    {
      "section_order_no": 1,
      "order_no": 1,
      "practice_item_id": 50,
      "question_id": 901
    }
  ]
}

---

### GET /practice/:id/jump
Query:
section=MCQ|CQ  
number=3  

Response:
{
  "item": {
    "section_order_no": 3,
    "order_no": 7,
    "practice_item_id": 55,
    "question_id": 910
  }
}

Errors:
- 404 QUESTION_NUMBER_NOT_FOUND

---

## Draft Answer Saving

### PATCH /practice/:id/answers
Request:
{
  "answers": [
    {
      "practice_item_id": 50,
      "answer_type": "MCQ",
      "selected_option_label": "B"
    },
    {
      "practice_item_id": 51,
      "answer_type": "CQ",
      "cq_text": "My written answer"
    }
  ]
}

Response:
{
  "saved": true
}

---

### GET /practice/:id/answers
Response:
{
  "answers": [
    {
      "practice_item_id": 50,
      "answer_type": "MCQ",
      "selected_option_label": "B",
      "cq_text": null,
      "updated_at": "2026-01-28T10:00:00Z"
    }
  ]
}

---

## Submission & Results

### POST /practice/:id/submit
Response:
{
  "practice_session_id": 123,
  "mcq_total": 20,
  "mcq_correct": 15,
  "mcq_score": 15
}

---

### GET /practice/:id/results
Query:
section=MCQ|CQ  
page=1  
page_size=10  

Response:
{
  "practice_session_id": 123,
  "section": "MCQ",
  "page": 1,
  "page_size": 10,
  "total_in_section": 20,
  "items": [
    {
      "section_order_no": 1,
      "order_no": 1,
      "practice_item_id": 50,
      "question": {
        "id": 901,
        "question_type": "MCQ",
        "stem_text": "...",
        "explanation": "...",
        "difficulty": 2,
        "source": "Dhaka 2023",
        "language": "bn"
      },
      "user_answer": {
        "selected_option_label": "C"
      },
      "mcq": {
        "correct_option_label": "D",
        "is_correct": false,
        "options": [
          { "label": "A", "option_text": "..." },
          { "label": "B", "option_text": "..." },
          { "label": "C", "option_text": "..." },
          { "label": "D", "option_text": "..." }
        ]
      },
      "media": []
    }
  ]
}

---

### GET /practice/:id/results/jump
Query:
section=MCQ|CQ  
number=3  

Response:
{
  "item": {
    "section_order_no": 3,
    "order_no": 7,
    "practice_item_id": 55,
    "question": { "...same shape as results item..." }
  }
}

---

## Constraints (DO NOT ASSUME)
- Backend responses are authoritative
- Do not hardcode enums or IDs
- Do not infer missing fields
- Requested counts ≠ returned counts
- Not all questions are answered
- Always handle error responses
