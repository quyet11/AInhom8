require('dotenv').config(); // Để sử dụng biến môi trường từ file .env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const pdfParse = require('pdf-parse');


const { GoogleGenerativeAI } = require("@google/generative-ai");


// Tạo ứng dụng Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Cấu hình MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Kết nối tới MySQL
db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối đến MySQL:', err);
        return;
    }
    console.log('Đã kết nối đến MySQL');
});

// Tạo transporter cho Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Hàm để gửi email xác thực
const sendVerificationEmail = (fullname, email) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Email Xác Thực',
        text: `Xin chào ${fullname}, Chúc mừng bạn đã đăng ký thành công =${email}`
    };

    return transporter.sendMail(mailOptions);
};
// Đăng nhập người dùng

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng nhập thất bại' });
        }

        // Nếu không tìm thấy người dùng
        if (results.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = results[0];
        if (password !== user.password) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        // Đăng nhập thành công
        return res.status(200).json({ message: 'Đăng nhập thành công', user: { user_type: user.user_type } });
    });
});

// API đăng ký người dùng
app.post('/register', (req, res) => {
    const { fullname, email, password, user_type } = req.body;

    // Kiểm tra định dạng email
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Vui lòng sử dụng địa chỉ Gmail hợp lệ' });
    }

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng ký thất bại' });
        }

        console.log('Kết quả kiểm tra email:', results); // In ra kết quả kiểm tra email

        // Kiểm tra nếu email đã tồn tại
        if (results.length > 0) {
            console.log('Email đã tồn tại:', email);
            return res.status(400).json({ message: 'Email đã tồn tại. Vui lòng sử dụng email khác.' });
        }

        // Nếu email chưa tồn tại, lưu thông tin người dùng vào MySQL
        const sql = 'INSERT INTO users (fullname, email, password, user_type) VALUES (?, ?, ?, ?)';
        db.query(sql, [fullname, email, password, user_type], (err, result) => {
            if (err) {
                console.error('Lỗi khi lưu dữ liệu:', err);
                return res.status(500).json({ message: 'Đăng ký thất bại' });
            }

            // Gửi email xác thực
            sendVerificationEmail(fullname, email)
                .then(() => {
                    return res.status(200).json({ message: 'Đăng ký thành công, kiểm tra email để xác thực!' });
                })
                .catch((error) => {
                    console.error('Lỗi khi gửi email:', error);
                    return res.status(500).json({ message: 'Không thể gửi email xác thực' });
                });
        });
    });
});app.post('/register', (req, res) => {
    const { fullname, email, password, user_type } = req.body;

    // Kiểm tra định dạng email
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Vui lòng sử dụng địa chỉ Gmail hợp lệ' });
    }

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra email:', err);
            return res.status(500).json({ message: 'Đăng ký thất bại' });
        }

        console.log('Kết quả kiểm tra email:', results); // In ra kết quả kiểm tra email

        // Kiểm tra nếu email đã tồn tại
        if (results.length > 0) {
            console.log('Email đã tồn tại:', email);
            return res.status(400).json({ message: 'Email đã tồn tại. Vui lòng sử dụng email khác.' });
        }

        // Nếu email chưa tồn tại, lưu thông tin người dùng vào MySQL
        const sql = 'INSERT INTO users (fullname, email, password, user_type) VALUES (?, ?, ?, ?)';
        db.query(sql, [fullname, email, password, user_type], (err, result) => {
            if (err) {
                console.error('Lỗi khi lưu dữ liệu:', err);
                return res.status(500).json({ message: 'Đăng ký thất bại' });
            }

            // Gửi email xác thực
            sendVerificationEmail(fullname, email)
                .then(() => {
                    return res.status(200).json({ message: 'Đăng ký thành công, kiểm tra email để xác thực!' });
                })
                .catch((error) => {
                    console.error('Lỗi khi gửi email:', error);
                    return res.status(500).json({ message: 'Không thể gửi email xác thực' });
                });
        });
    });
});


// API để thêm job posting
// API để thêm job posting
app.post('/job-postings', (req, res) => {
    // Kiểm tra dữ liệu từ request body
    const { jobTitle, jobDescription, requiredSkills, experience, salaryRange, expiryDate, jobType, postedDate } = req.body;

    if (!jobTitle || !jobDescription || !requiredSkills || !experience || !salaryRange || !expiryDate || !jobType || !postedDate) {
        return res.status(400).json({ message: 'Thiếu dữ liệu cần thiết cho job posting' });
    }

    const sql = `INSERT INTO job_postings (job_title, job_description, required_skills, experience, salary_range, expiry_date, job_type, posted_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; // Thêm posted_date vào cột

    // Chèn dữ liệu vào CSDL
    db.query(sql, [jobTitle, jobDescription, requiredSkills, experience, salaryRange, expiryDate, jobType, postedDate], (err, result) => {
        if (err) {
            console.error('Lỗi khi lưu job posting:', err);
            return res.status(500).json({ message: 'Lưu job posting thất bại' });
        }
        return res.status(201).json({ message: 'Lưu job posting thành công' });
    });
});



app.get('/job-postings', (req, res) => {
    const sql = 'SELECT * FROM job_postings ORDER BY posted_date DESC';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách job postings:', err);
            return res.status(500).json({ message: 'Lấy danh sách thất bại' });
        }

        // Trả về danh sách job postings
        return res.status(200).json(results);
    });
});


// DELETE route to delete a job posting by ID
app.delete('/job-postings/:id', (req, res) => {
    const jobId = req.params.id;
    const sql = 'DELETE FROM job_postings WHERE id = ?';

    db.query(sql, [jobId], (err, results) => {
        if (err) {
            console.error('Lỗi khi xóa job posting:', err);
            return res.status(500).json({ message: 'Xóa thất bại' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy job posting' });
        }

        return res.status(200).json({ message: 'Xóa thành công' });
    });
});
// PUT route to update a job posting by ID
app.put('/job-postings/:id', (req, res) => {
    const jobId = req.params.id;
    const { job_title, expiry_date,required_skills,job_description} = req.body;
    const sql = 'UPDATE job_postings SET job_title = ?,job_description=?,required_skills =?, expiry_date = ? WHERE id = ?';

    db.query(sql, [job_title,job_description,required_skills, expiry_date, jobId], (err, results) => {
        if (err) {
            console.error('Lỗi khi cập nhật job posting:', err);
            return res.status(500).json({ message: 'Cập nhật thất bại' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy job posting' });
        }

        return res.status(200).json({ message: 'Cập nhật thành công' });
    });
});





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Đường dẫn đến thư mục bạn muốn lưu tệp
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Đặt tên cho tệp
    },
});
//
const uploadd = multer({ storage: multer.memoryStorage() }); // Định nghĩa một bộ nhớ tạm thời
const upload = multer({ storage: storage }); // Chỉ nên định nghĩa một lần


// Route để nhận thông tin ứng tuyển
app.post('/api/apply', upload.single('cv'), (req, res) => {
    console.log('Request body:', req.body);
    // If you are using session and want to get user ID, you can uncomment the next line
    // console.log('User ID:', req.user.id);

    const { fullName, email, coverLetter, jobId } = req.body; // Removed userId from here
    const cvPath = req.file ? req.file.path : null;

    // Updated the check for required fields to exclude userId
    if (!fullName || !email || !coverLetter || !cvPath || !jobId) {
        return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }

    const sql = 'INSERT INTO applications (name, email, cover_letter, cv, job_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [fullName, email, coverLetter, cvPath, jobId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Lỗi khi lưu đơn ứng tuyển' });
        }
        res.status(200).json({ message: 'Đơn ứng tuyển đã được gửi thành công' });
    });
});


// API để lưu hồ sơ ứng viên
app.post('/api/candidate-profile', upload.single('profilePicture'), (req, res) => {
    const { fullName, email, workExperience, education } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!fullName || !email || !profilePicture || !workExperience || !education) {
        return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }

    // Kiểm tra email đã tồn tại chưa
    const checkEmailSql = 'SELECT * FROM candidate_profiles WHERE email = ?';
    db.query(checkEmailSql, [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Lỗi kiểm tra email' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Nếu email chưa tồn tại, tiếp tục lưu dữ liệu
        const sql = 'INSERT INTO candidate_profiles (full_name, email, profile_picture, work_experience, education) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [fullName, email, profilePicture, workExperience, education], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({ message: 'Lỗi khi lưu thông tin ứng viên' });
            }
            res.status(200).json({ message: 'Lưu thông tin ứng viên thành công' });
        });
    });
});




// API để lấy danh sách ứng viên
app.get('/api/candidates', (req, res) => {
    const sql = 'SELECT * FROM candidate_profiles';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng viên:', err);
            return res.status(500).json({ message: 'Lấy danh sách ứng viên thất bại' });
        }

        return res.status(200).json(results);
    });
});
app.get('/api/applications/:jobId', (req, res) => {
    const { jobId } = req.params;
    const sql = 'SELECT * FROM applications WHERE job_id = ?';

    db.query(sql, [jobId], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng tuyển:', err);
            return res.status(500).json({ message: 'Lấy danh sách ứng tuyển thất bại' });
        }

        return res.status(200).json(results);
    });
});
app.get('/api/applicants', (req, res) => {
    const sql = `
        SELECT applications.id, applications.name, job_postings.experience, applications.status, job_postings.job_title
        FROM applications
                 JOIN job_postings ON applications.job_id = job_postings.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách ứng viên:', err);
            res.status(500).json({ message: 'Lỗi khi lấy danh sách ứng viên' });
        } else {
            res.json(results);
        }
    });
});

// In your Express server file
app.use(express.json());
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function repairAndParsePDF(buffer) {
    try {
        const pdfDoc = await PDFDocument.load(buffer);  // Tải tệp PDF
        const repairedBuffer = await pdfDoc.save();  // Tái lưu tệp để sửa lỗi cấu trúc
        const data = await pdfParse(repairedBuffer);  // Phân tích tệp PDF tái lưu
        return data.text;
    } catch (error) {
        console.error("Error repairing or parsing PDF:", error.message);
        throw error;
    }
}


// In your Express server file
app.use(express.json());
const gemiAI = new GoogleGenerativeAI("AIzaSyDujl7jCTfhCT1Apwb9UJdIR8uSdyGCRQw");

app.post('/api/evaluate_cv', uploadd.single('cv_file'), async (req, res) => {
    console.log('Dữ liệu nhận được:', req.body); // Log dữ liệu từ frontend
    console.log('File tải lên:', req.file); // Log file được tải lên

    try {
        const { job_description, required_skills } = req.body;
        const cvFile = req.file;

        if (!cvFile || !cvFile.buffer) {
            console.error("Không nhận được buffer của file tải lên.");
            return res.status(400).json({ error: 'File không hợp lệ hoặc bị thiếu.' });

        }

        // Kiểm tra xem cvFile.buffer có tồn tại và có phải là Buffer không


        let pdfData;
        try {
            pdfData = await pdfParse(cvFile.buffer); // Phân tích từ buffer
            cvContent = pdfData.text;
            console.log("Nội dung CV đã phân tích:", cvContent); // Log nội dung CV đã phân tích
        } catch (error) {
            console.error("Lỗi Phân Tích PDF:", error.message);
            return res.status(400).json({ error: `Không thể xử lý tệp CV: ${error.message}` });
        }

        // Khởi tạo mô hình AI
        const model = gemiAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Đánh giá mức độ liên quan của CV sau đây với mô tả công việc và các kỹ năng cần thiết dưới đây:
        
        
        
        CV: ${cvContent}
        
        Mô tả công việc: ${job_description}
        
        Kỹ năng bắt buộc: ${required_skills}
        
        Tính toán tỷ lệ phần trăm phù hợp dựa trên các kỹ năng và kinh nghiệm cần thiết, đồng thời đưa ra đánh giá tổng quan.
        `;

        try {
            const response = await model.generateContent([prompt]);
            console.log("Phản hồi từ AI:", JSON.stringify(response, null, 2)); // Log phản hồi chi tiết

            // Trích xuất kết quả từ phản hồi
            const evaluationResult = response && response.response && response.response.candidates && response.response.candidates.length > 0
                ? response.response.candidates[0].content.parts[0].text // Lấy nội dung đánh giá
                : "Không tìm thấy kết quả đánh giá.";

            return res.json({ evaluation_result: evaluationResult });
        } catch (error) {
            console.log("Lỗi từ Gemini API: ", error.message);
            return res.status(500).json({ error: `Lỗi khi gọi Gemini API: ${error.message}` });
        }

    } catch (error) {
        console.log("Lỗi không mong muốn: ", error.message);
        return res.status(500).json({ error: 'Có lỗi không mong muốn xảy ra.' });
    }
});
app.get('/api/applicants/:id', (req, res) => {
    const { id } = req.params; // Lấy ID từ tham số URL
    const sql = `
        SELECT a.*, j.job_description, j.required_skills
        FROM applications AS a
                 JOIN job_postings AS j ON a.job_id = j.id
        WHERE a.id = ?
    `; // Truy vấn để lấy thông tin ứng viên và thông tin từ bảng job_postings

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin ứng viên:', err);
            return res.status(500).json({ message: 'Lấy thông tin ứng viên thất bại' });
        }

        // Kiểm tra xem có ứng viên nào với ID đã cho không
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ứng viên với ID đã cho.' });
        }

        // Lấy thông tin ứng viên và các trường liên quan
        const applicant = results[0];
        const jobDescription = applicant.job_description;
        const requiredSkills = applicant.required_skills;

        // Log job_description và required_skills
        console.log('Job Description:', jobDescription);
        console.log('Required Skills:', requiredSkills);

        // Trả về thông tin ứng viên cùng với thông tin từ job_postings
        return res.status(200).json(applicant);
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Đoạn mã trong file server.js (hoặc nơi bạn định nghĩa API)
app.post('/api/applicants/:id/reject', (req, res) => {
    const applicantId = req.params.id;

    const sql = 'UPDATE applications SET status = ? WHERE id = ?';
    db.query(sql, ['rejected', applicantId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ message: 'Lỗi khi từ chối ứng viên' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Ứng viên không tồn tại' });
        }

        res.status(200).json({ message: 'Ứng viên đã bị từ chối' });
    });
});

app.post('/api/evaluate_all_cvs', async (req, res) => {
    console.log("API evaluate_all_cvs được gọi");

    // Log thông tin nhận được từ body (data gửi từ frontend)
    console.log("Thông tin body nhận được:", req.body); // Để kiểm tra thông tin body gửi từ frontend

    // Log thông tin về các file nếu có
    if (req.files) {
        console.log("Các file tải lên:", req.files); // Nếu sử dụng nhiều file
    } else if (req.file) {
        console.log("File tải lên:", req.file); // Nếu sử dụng một file
    }

    try {
        // Truy vấn tất cả các ứng viên và công việc tương ứng từ database
        const [applications] = await db.promise().query(`
            SELECT a.id as application_id, a.name, a.cv, a.job_id, j.job_description, j.required_skills
            FROM applications a
                     JOIN job_postings j ON a.job_id = j.id
        `);

        // Kiểm tra nếu không có ứng viên nào
        if (!applications.length) {
            return res.status(404).json({ message: 'Không có ứng viên nào để đánh giá.' });
        }

        const results = [];

        // Duyệt qua từng ứng viên và đánh giá CV của họ
        for (const application of applications) {
            const { cv, job_description, required_skills } = application;

            // Log thông tin ứng viên và công việc
            console.log("Thông tin ứng viên:", application);
            console.log("Mô tả công việc:", job_description);
            console.log("Kỹ năng yêu cầu:", required_skills);

            // Phân tích PDF để lấy nội dung CV
            let cvContent = '';
            try {
                const pdfData = await pdfParse(Buffer.from(cv, 'base64')); // Giả sử CV lưu dưới dạng base64
                cvContent = pdfData.text;
            } catch (error) {
                console.error("Lỗi phân tích CV:", error.message);
                continue; // Nếu không thể phân tích CV, bỏ qua ứng viên này
            }

            // Log nội dung CV đã phân tích
            console.log("Nội dung CV đã phân tích:", cvContent);

            // Tạo prompt cho AI
            const prompt = `
                Đánh giá mức độ liên quan của CV sau đây với mô tả công việc và các kỹ năng cần thiết dưới đây:

                CV: ${cvContent}

                Mô tả công việc: ${job_description}

                Kỹ năng bắt buộc: ${required_skills}

                Tính toán tỷ lệ phần trăm phù hợp dựa trên các kỹ năng và kinh nghiệm cần thiết, đồng thời đưa ra đánh giá tổng quan.
            `;

            // Gọi AI để đánh giá CV
            try {
                const model = gemiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const response = await model.generateContent([prompt]);
                const evaluationResult = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Không tìm thấy kết quả đánh giá.";

                // Thêm kết quả đánh giá vào danh sách kết quả
                results.push({
                    application_id: application.application_id,
                    name: application.name,
                    evaluation_result: evaluationResult
                });

                // Log kết quả đánh giá
                console.log("Kết quả đánh giá ứng viên:", evaluationResult);

            } catch (error) {
                console.error("Lỗi khi gọi Gemini API:", error.message);
                continue; // Nếu có lỗi khi gọi AI, bỏ qua ứng viên này
            }
        }

        // Trả về kết quả đánh giá của tất cả các ứng viên
        return res.json({ evaluations: results });

    } catch (error) {
        console.error("Lỗi không mong muốn: ", error.message);
        return res.status(500).json({ error: 'Có lỗi không mong muốn xảy ra.' });
    }
});

// Chạy server trên cổng 3001
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
