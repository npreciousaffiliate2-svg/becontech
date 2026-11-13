
-- ─── 1. SEED COLLEGE ───
INSERT INTO colleges (id, name, short_name, domain, active_session, active_semester)
VALUES ('bethsaida', 'Bethsaida College of Health Technology', 'BCHT', 'bethsaida.edu.ng', '2026/2027', 'Harmattan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ─── 2. SEED DEPARTMENTS ───
INSERT INTO departments (id, college_id, code, name, regulatory_body, accreditation_status, approved_quota, hod_name, hod_email)
VALUES 
('dept-che', 'bethsaida', 'CHE', 'Community Health Science', 'CHPRBN', 'FULL', 120, 'Dr. Amina Bello', 'hod.chew@bethsaida.edu.ng'),
('dept-mlt', 'bethsaida', 'MLT', 'Medical Laboratory Science', 'MLSCN', 'FULL', 80, 'Dr. Samuel Okonkwo', 'hod.mlt@bethsaida.edu.ng'),
('dept-pht', 'bethsaida', 'PHT', 'Pharmacy Technician', 'PCN', 'FULL', 100, 'Pharm. Ngozi Eze', 'hod.pht@bethsaida.edu.ng'),
('dept-him', 'bethsaida', 'HIM', 'Health Information Management', 'HRORBN', 'FULL', 60, 'Mr. Bamidele Adeleke', 'hod.him@bethsaida.edu.ng'),
('dept-eht', 'bethsaida', 'EHT', 'Environmental Health Technology', 'EHORECON', 'FULL', 90, 'Sanitarian Tunde Bakare', 'hod.eht@bethsaida.edu.ng')
ON CONFLICT (id) DO NOTHING;

-- ─── 3. SEED PROFILES / PERSONAS ───
INSERT INTO profiles (id, college_id, email, full_name, role, department_code, matric_number, phone)
VALUES
('usr-provost-01', 'bethsaida', 'provost@bethsaida.edu.ng', 'Dr. Timothy Balogun', 'PROVOST', NULL, NULL, '+234 803 111 0001'),
('usr-bursar-01', 'bethsaida', 'bursar@bethsaida.edu.ng', 'Alhaji Rasheed Alabi', 'BURSAR', NULL, NULL, '+234 803 111 0002'),
('usr-reg-01', 'bethsaida', 'registrar@bethsaida.edu.ng', 'Mrs. Folashade Adeleke', 'REG', NULL, NULL, '+234 803 111 0003'),
('usr-exam-01', 'bethsaida', 'exams@bethsaida.edu.ng', 'Dr. Kenneth Nwosu', 'EXAM', NULL, NULL, '+234 803 111 0004'),
('usr-hod-01', 'bethsaida', 'hod.chew@bethsaida.edu.ng', 'Dr. Amina Bello', 'HOD', 'CHE', NULL, '+234 803 111 0005'),
('usr-instr-01', 'bethsaida', 'o.johnson@bethsaida.edu.ng', 'Mr. Olumide Johnson', 'INSTR', 'CHE', NULL, '+234 803 111 0006'),
('usr-clinsup-01', 'bethsaida', 'g.okafor@uch-ibadan.org.ng', 'Matron Grace Okafor', 'CLINSUP', 'CHE', NULL, '+234 803 111 0007'),
('usr-stu-01', 'bethsaida', 'che.2026.0014@bethsaida.edu.ng', 'Blessing Adeyemi', 'STU', 'CHE', 'CHE/2026/0014', '+234 814 555 0192')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ─── 4. SEED STUDENTS ───
INSERT INTO students (id, college_id, matric_number, full_name, email, phone, department_code, programme, level, cgpa, fees_status, clinical_clearance, attendance_percentage, status)
VALUES
('stu-001', 'bethsaida', 'CHE/2026/0014', 'Blessing Adeyemi', 'che.2026.0014@bethsaida.edu.ng', '+234 814 555 0192', 'CHE', 'Community Health Extension Worker (CHEW)', '200 Level', 4.25, 'PARTIAL', 'CLEARED', 92.5, 'ACTIVE'),
('stu-002', 'bethsaida', 'MLT/2026/0029', 'Emmanuel Chukwuma', 'e.chukwuma@bethsaida.edu.ng', '+234 802 333 4444', 'MLT', 'Medical Laboratory Technician (MLT)', '100 Level', 3.80, 'CLEARED', 'CLEARED', 88.0, 'ACTIVE'),
('stu-003', 'bethsaida', 'PHT/2026/0088', 'Fatima Danjuma', 'f.danjuma@bethsaida.edu.ng', '+234 805 777 8888', 'PHT', 'Pharmacy Technician (PHT)', '200 Level', 3.45, 'PARTIAL', 'CLEARED', 81.0, 'ACTIVE'),
('stu-004', 'bethsaida', 'CHE/2026/0105', 'Godwin Bassey', 'g.bassey@bethsaida.edu.ng', '+234 809 111 2222', 'CHE', 'Community Health Extension Worker (CHEW)', '300 Level', 1.85, 'OWING', 'BARRED', 62.0, 'PROBATION')
ON CONFLICT (matric_number) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ─── 5. SEED STUDENT LEDGERS (Integer Kobo) ───
INSERT INTO student_ledgers (id, college_id, student_id, matric_number, entry_type, category, description, amount_kobo, balance_after_kobo, reference_id, created_at)
VALUES
('led-001', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'debit', 'tuition', 'Harmattan Semester 2026/2027 Tuition Fee (CHEW 200L)', 12000000, 12000000, 'chg-chew-200-t1', '2026-11-03 08:00:00+00'),
('led-002', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'debit', 'clinical_posting', 'Rural Health Clinical Posting Levy (PHC Posting)', 3500000, 15500000, 'chg-chew-cln-01', '2026-11-03 08:05:00+00'),
('led-003', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'credit', 'tuition', 'Paystack Card Settlement — Part Payment Ref: PSTK_91823719', 10000000, 5500000, 'pay-pstk-001', '2026-11-05 11:20:00+00'),
('led-004', 'bethsaida', 'stu-002', 'MLT/2026/0029', 'debit', 'tuition', 'Harmattan Semester 2026/2027 Tuition Fee (MLT 100L)', 14000000, 14000000, 'chg-mlt-100-t1', '2026-11-03 08:00:00+00'),
('led-005', 'bethsaida', 'stu-002', 'MLT/2026/0029', 'credit', 'tuition', 'Remita Bank Branch Transfer Settlement — Ref: RMT_8820192', 14000000, 0, 'pay-rmt-002', '2026-11-06 14:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 6. SEED OFFICIAL RECEIPTS ───
INSERT INTO official_receipts (receipt_number, college_id, student_id, student_name, matric_number, programme, level, category, amount_kobo, payment_method, transaction_reference, gateway_reference, qr_verification_hash, issuer, paid_at)
VALUES
('RCP-2026-00104', 'bethsaida', 'stu-001', 'Blessing Adeyemi', 'CHE/2026/0014', 'Community Health Extension Worker (CHEW)', '200 Level', 'tuition', 10000000, 'paystack', 'BTH-TX-2026-9021', 'PSTK_91823719', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'Bursary Department, Bethsaida College', '2026-11-05 11:20:00+00'),
('RCP-2026-00105', 'bethsaida', 'stu-002', 'Emmanuel Chukwuma', 'MLT/2026/0029', 'Medical Laboratory Technician (MLT)', '100 Level', 'tuition', 14000000, 'remita', 'BTH-TX-2026-9022', 'RMT_8820192', 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef0', 'Bursary Department, Bethsaida College', '2026-11-06 14:15:00+00')
ON CONFLICT (receipt_number) DO NOTHING;

-- ─── 7. SEED COURSE SCORES (Blessing Adeyemi's Broadsheet) ───
INSERT INTO course_scores (id, college_id, student_id, matric_number, course_code, course_title, credit_units, ca_score, exam_score, total_score, grade, grade_point, semester, academic_session, is_ratified)
VALUES
('sc-001', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'CHE 201', 'Primary Health Care & Community Mobilization', 3, 26.0, 52.0, 78.0, 'A', 5.00, 'Harmattan', '2026/2027', true),
('sc-002', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'CHE 203', 'Maternal & Child Health Logistics', 3, 24.0, 48.0, 72.0, 'A', 5.00, 'Harmattan', '2026/2027', true),
('sc-003', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'CHE 205', 'Clinical Skills in PHC Setting', 2, 22.0, 43.0, 65.0, 'B', 4.00, 'Harmattan', '2026/2027', true),
('sc-004', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'GNS 201', 'Use of English & Communication', 2, 21.0, 42.0, 63.0, 'B', 4.00, 'Harmattan', '2026/2027', true)
ON CONFLICT (id) DO NOTHING;

-- ─── 8. SEED CLINICAL POSTING ───
INSERT INTO clinical_postings (id, college_id, student_id, matric_number, student_name, hospital_name, ward_specialty, rotation_period, preceptor_name, logbook_completed, preceptor_sign_off, clearance_status)
VALUES
('cln-001', 'bethsaida', 'stu-001', 'CHE/2026/0014', 'Blessing Adeyemi', 'University College Hospital (UCH)', 'Antenatal & Immunization Clinic', '8 Weeks (Oct - Dec 2026)', 'Matron Grace Okafor', true, true, 'CLEARED'),
('cln-002', 'bethsaida', 'stu-002', 'MLT/2026/0029', 'Emmanuel Chukwuma', 'Adeoyo Maternity Hospital', 'Hematology & Blood Transfusion Lab', '6 Weeks (Oct - Nov 2026)', 'MLS Kolawole Adeleke', false, false, 'IN_PROGRESS')
ON CONFLICT (id) DO NOTHING;

-- ─── 9. SEED HOSTEL BED ALLOCATIONS ───
INSERT INTO hostel_allocations (id, college_id, hall_name, room_number, bed_space, student_id, matric_number, occupant_name, status)
VALUES
('hst-001', 'bethsaida', 'Florence Nightingale Hall (Female)', 'Room 104', 'Bed A', 'stu-001', 'CHE/2026/0014', 'Blessing Adeyemi', 'OCCUPIED'),
('hst-002', 'bethsaida', 'Sir Alexander Fleming Hall (Male)', 'Room 208', 'Bed B', 'stu-002', 'MLT/2026/0029', 'Emmanuel Chukwuma', 'OCCUPIED'),
('hst-003', 'bethsaida', 'Florence Nightingale Hall (Female)', 'Room 104', 'Bed B', NULL, NULL, NULL, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- ─── 10. SEED AUDIT LOGS ───
INSERT INTO audit_logs (id, college_id, actor_id, actor_role, action, entity_type, entity_id, chain_hash, prev_hash, timestamp)
VALUES
('aud-001', 'bethsaida', 'usr-provost-01', 'PROVOST', 'SESSION_CONFIGURATION_APPROVED', 'TENANT_SETTINGS', 'bethsaida:2026/2027', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '0000000000000000000000000000000000000000000000000000000000000000', '2026-11-01 08:00:00+00'),
('aud-002', 'bethsaida', 'usr-bursar-01', 'BURSAR', 'FEE_SCHEDULE_VERSION_PUBLISHED', 'FEE_STRUCTURE', 'fee-sched-2026-v1', '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '2026-11-02 09:30:00+00')
ON CONFLICT (id) DO NOTHING;
