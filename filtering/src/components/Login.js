import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import Helmet from "react-helmet";

const Login = ({toggleForm}) => {
    const navigate = useNavigate();

    // Kiểm tra nếu đã đăng nhập và điều hướng đến trang home tương ứng
    useEffect(() => {
        const userToken = sessionStorage.getItem('userToken');
        if (userToken) {
            navigate(userToken === 'applicant' ? '/Job-Board' : '/RecruiterHome', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const res = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                alert("Đăng nhập thành công");

                // Lưu ID người dùng vào sessionStorage
                const userToken = data.user.id;
                sessionStorage.setItem('userToken', userToken);

                // Điều hướng tới trang phù hợp dựa trên user_type
                if (data.user.user_type === 'applicant') {
                    navigate('/Job-Board');
                } else if (data.user.user_type === 'recruiter') {
                    navigate('/RecruiterHome');
                }
            } else {
                alert("Sai email hoặc mật khẩu.");
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
            alert("Có lỗi xảy ra khi đăng nhập.");
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password'); // Điều hướng đến trang ForgotPassword
    };

    return (
        <div className="container">
            <Helmet>
                <style>{`
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        display: block;
                        justify-content: center;
                    }

                    .container {
                        width: 100%;
                        max-width: 400px;
                        margin: 50px auto;
                        padding: 20px 90px;
                        background-color: white;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }

                    h2 {
                        text-align: center;
                    }

                    input[type="text"], input[type="email"], input[type="password"], select {
                        width: 100%;
                        padding: 10px;
                        margin: 10px 0;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                    }

                    .button {
                        width: 100%;
                        padding: 10px;
                        background-color: #28a745;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    .button:hover {
                        background-color: #218838;
                    }

                    .links {
                        text-align: center;
                        margin-top: 10px;
                    }

                    .links a {
                        color: #007BFF;
                        text-decoration: none;
                    }
                `}</style>
            </Helmet>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required />

                <div className="checkbox">
                    <label>
                        <input type="checkbox" /> Remember Me
                    </label>
                    <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                </div>

                <button type="submit" className="button">Login</button>

                <div className="links">
                    <span>Don't have an account?</span>
                    <a href="#" onClick={toggleForm}>Register Now</a>
                </div>
            </form>
        </div>
    );
};

export default Login;
