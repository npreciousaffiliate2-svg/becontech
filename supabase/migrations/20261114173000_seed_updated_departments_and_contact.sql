-- ─── 1. UPDATE COLLEGE & TENANT SETTINGS WITH OFFICIAL CONTACT DETAILS ───
UPDATE colleges
SET 
    domain = 'becohtech.edu.ng',
    name = 'Bethsaida College of Health Technology Ltd',
    short_name = 'BCHT'
WHERE id = 'bethsaida';

UPDATE tenant_settings
SET 
    campus_address = 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State, Nigeria',
    official_email = 'info@becohtech.edu.ng',
    official_phone = '+234 907 578 9045, +234 907 451 7476',
    website_url = 'https://becohtech.edu.ng',
    regulatory_councils = ARRAY[
        'Community Health Practitioners Registration Board of Nigeria (CHPRBN)',
        'Environmental Health Officers Registration Council of Nigeria (EHORECON)',
        'Health Records Officers Registration Board of Nigeria (HRORBN)',
        'Dental Therapists Registration Board of Nigeria (DTRBN)',
        'Pharmacy Council of Nigeria (PCN)',
        'Federal Ministry of Health (FMOH)',
        'National Board for Technical Education (NBTE)'
    ]
WHERE college_id = 'bethsaida';

-- ─── 2. SEED THE 7 OFFICIAL DEPARTMENTS ───
INSERT INTO departments (id, college_id, code, name, regulatory_body, accreditation_status, approved_quota, hod_name, hod_email)
VALUES 
('dept-dhd', 'bethsaida', 'DHD', 'Dental Health Department', 'DTRBN', 'FULL', 150, 'Dr. A. O. Adeleke', 'hod.dhd@becohtech.edu.ng'),
('dept-ehd', 'bethsaida', 'EHD', 'Environmental Health Department', 'EHORECON', 'FULL', 200, 'Sanitarian B. Ibrahim', 'hod.ehd@becohtech.edu.ng'),
('dept-him', 'bethsaida', 'HIM', 'Health Information Management Department', 'HRORBN', 'FULL', 180, 'Mrs. T. Adeleke', 'hod.him@becohtech.edu.ng'),
('dept-htd', 'bethsaida', 'HTD', 'Health Technician Department', 'FMOH', 'FULL', 160, 'Mr. S. O. Alabi', 'hod.htd@becohtech.edu.ng'),
('dept-pht', 'bethsaida', 'PHT', 'Pharmacy Technician Department', 'PCN', 'FULL', 250, 'Pharm. F. Oladipo', 'hod.pht@becohtech.edu.ng'),
('dept-had', 'bethsaida', 'HAD', 'Health Assistant Department', 'FMOH', 'FULL', 150, 'Nurse E. O. Okon', 'hod.had@becohtech.edu.ng'),
('dept-chd', 'bethsaida', 'CHD', 'Community Health Department', 'CHPRBN', 'FULL', 400, 'Dr. K. Bello', 'hod.chd@becohtech.edu.ng')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    regulatory_body = EXCLUDED.regulatory_body,
    hod_name = EXCLUDED.hod_name,
    hod_email = EXCLUDED.hod_email,
    approved_quota = EXCLUDED.approved_quota;

-- Also sync into college_departments table
INSERT INTO college_departments (id, college_id, code, name, hod_name, hod_title, hod_email, hod_phone, office_location, approved_quota, regulatory_body, accreditation_status, accreditation_valid_until)
VALUES 
('dept-dhd', 'bethsaida', 'DHD', 'Dental Health Department', 'Dr. A. O. Adeleke', 'Consultant Dental Surgeon & Head of Department', 'hod.dhd@becohtech.edu.ng', '+234 907 578 9045', 'Dental Sciences Complex, Block A, Room 102', 150, 'DTRBN', 'FULL', 'October 2028'),
('dept-ehd', 'bethsaida', 'EHD', 'Environmental Health Department', 'Sanitarian B. Ibrahim', 'Chief Environmental Health Officer & Head of Department', 'hod.ehd@becohtech.edu.ng', '+234 907 451 7476', 'Public Health Pavilion, Suite E1', 200, 'EHORECON', 'FULL', 'September 2028'),
('dept-him', 'bethsaida', 'HIM', 'Health Information Management Department', 'Mrs. T. Adeleke', 'Principal Lecturer & Head of Department', 'hod.him@becohtech.edu.ng', '+234 907 578 9045', 'Administration Annex, Room 108', 180, 'HRORBN', 'FULL', 'January 2029'),
('dept-htd', 'bethsaida', 'HTD', 'Health Technician Department', 'Mr. S. O. Alabi', 'Senior Lecturer & Head of Department', 'hod.htd@becohtech.edu.ng', '+234 907 451 7476', 'Primary Care Education Center, Wing C', 160, 'FMOH', 'FULL', 'November 2027'),
('dept-pht', 'bethsaida', 'PHT', 'Pharmacy Technician Department', 'Pharm. F. Oladipo', 'Chief Pharmacist & Head of Department', 'hod.pht@becohtech.edu.ng', '+234 907 578 9045', 'Pharmaceutical Sciences Wing, Lab P1', 250, 'PCN', 'FULL', 'June 2028'),
('dept-had', 'bethsaida', 'HAD', 'Health Assistant Department', 'Nurse E. O. Okon', 'Chief Nursing Officer & Head of Department', 'hod.had@becohtech.edu.ng', '+234 907 451 7476', 'Clinical Practice Annex, Ground Floor', 150, 'FMOH', 'FULL', 'August 2027'),
('dept-chd', 'bethsaida', 'CHD', 'Community Health Department', 'Dr. K. Bello', 'Chief Lecturer & Head of Department', 'hod.chd@becohtech.edu.ng', '+234 907 578 9045', 'Health Sciences Complex, Suite B101', 400, 'CHPRBN', 'FULL', 'November 2028')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    hod_name = EXCLUDED.hod_name,
    hod_title = EXCLUDED.hod_title,
    hod_email = EXCLUDED.hod_email,
    hod_phone = EXCLUDED.hod_phone,
    office_location = EXCLUDED.office_location,
    approved_quota = EXCLUDED.approved_quota,
    regulatory_body = EXCLUDED.regulatory_body,
    accreditation_valid_until = EXCLUDED.accreditation_valid_until;

-- ─── 3. SEED THE OFFERED PROGRAMMES ───
INSERT INTO college_programmes (id, college_id, department_id, name, code, duration_years, semesters, credential_awarded, board_quota, regulatory_body, accreditation_status)
VALUES 
('prog-dht', 'bethsaida', 'dept-dhd', 'Dental Health Technician (DHT)', 'DHT', 3, 6, 'Professional Diploma in Dental Health', 80, 'DTRBN', 'FULL'),
('prog-dst', 'bethsaida', 'dept-dhd', 'Dental Surgery Technician (DST)', 'DST', 3, 6, 'Professional Diploma in Dental Surgery', 70, 'DTRBN', 'FULL'),
('prog-eht', 'bethsaida', 'dept-ehd', 'Environmental Health Technician (EHT)', 'EHT', 3, 6, 'Professional National Diploma', 120, 'EHORECON', 'FULL'),
('prog-eha', 'bethsaida', 'dept-ehd', 'Environmental Health Assistant (EHA)', 'EHA', 2, 4, 'Professional Certificate', 80, 'EHORECON', 'FULL'),
('prog-him-nd', 'bethsaida', 'dept-him', 'National Diploma in Health Information Management', 'HIM-ND', 2, 4, 'National Diploma (ND)', 100, 'HRORBN', 'FULL'),
('prog-him-hnd', 'bethsaida', 'dept-him', 'Higher National Diploma in Health Information Management', 'HIM-HND', 2, 4, 'Higher National Diploma (HND)', 80, 'HRORBN', 'FULL'),
('prog-ht', 'bethsaida', 'dept-htd', 'Health Technician (HT)', 'HT', 3, 6, 'Professional Diploma in Health Technology', 160, 'FMOH', 'FULL'),
('prog-pht', 'bethsaida', 'dept-pht', 'Pharmacy Technician (PHT)', 'PHT', 3, 6, 'Professional Diploma in Pharmacy Practice', 250, 'PCN', 'FULL'),
('prog-ha', 'bethsaida', 'dept-had', 'Health Assistant (HA)', 'HA', 2, 4, 'Professional Certificate in Primary Health Support', 150, 'FMOH', 'FULL'),
('prog-chew', 'bethsaida', 'dept-chd', 'Community Health Extension Worker (CHEW)', 'CHEW', 3, 6, 'Professional National Diploma', 250, 'CHPRBN', 'FULL'),
('prog-jchew', 'bethsaida', 'dept-chd', 'Junior Community Health Extension Worker (JCHEW)', 'JCHEW', 2, 4, 'Professional Certificate', 150, 'CHPRBN', 'FULL')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    duration_years = EXCLUDED.duration_years,
    semesters = EXCLUDED.semesters,
    credential_awarded = EXCLUDED.credential_awarded,
    board_quota = EXCLUDED.board_quota,
    regulatory_body = EXCLUDED.regulatory_body;
