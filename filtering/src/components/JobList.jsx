import React, { useState, useEffect } from "react";
import '../styles/jobboard.css';
import Helmet from "react-helmet";  // Nhập file CSS chính
import '../styles/animate.min.css'
import '../styles/custom-bs.css'
import '../styles/jquery.fancybox.min.css'
import '../styles/bootstrap-select.min.css'
import '../styles/owl.carousel.min.css'
import 'icomoon/style.css';
import jobLogo from '../images/job_logo_1.jpg';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';
import 'bootstrap-select/dist/js/bootstrap-select.min.js';
import $ from 'jquery';
import {Link} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
// import { Viewer, Worker } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/core/lib/styles/index.css';
const JobList = () => {

    const [applicants, setApplicants] = useState([]);
    const [jobApplications, setJobApplications] = useState([]); // Renamed to match the context
    const navigate = useNavigate();
    const [applicant, setApplicant] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        title: '',
        name: '',
        experience: ''
    });
    const [filteredJobs, setFilteredJobs] = useState([]);
    useEffect(() => {
        const fetchJobApplications = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/applicants'); // Đảm bảo URL API chính xác
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                const data = await response.json();
                console.log(data); // Kiểm tra dữ liệu trả về

                // Chỉ giữ lại các ứng viên có status là 'pending'
                const filteredApplicants = data.filter(applicant => applicant.status === 'pending');
                setApplicants(filteredApplicants);
                setJobApplications(filteredApplicants); // Cập nhật danh sách ứng viên với status 'pending'
                setFilteredJobs(filteredApplicants); // Khởi tạo danh sách lọc ban đầu

            } catch (error) {
                console.error('Error fetching job applications:', error);
            }
        };

        fetchJobApplications();
    }, []);

    const handleShortlistClick = (applicantId) => {
        navigate(`/applicant/${applicantId}`);
    };
    const handleSearch = (e) => {
        e.preventDefault();
        const filtered = jobApplications.filter(application => {
            return (
                (searchFilters.title === '' || application.job_title.toLowerCase().includes(searchFilters.title.toLowerCase())) &&
                (searchFilters.name === '' || application.name.toLowerCase().includes(searchFilters.name.toLowerCase())) &&
                (searchFilters.experience === '' || application.experience.toLowerCase().includes(searchFilters.experience.toLowerCase()))
            );
        });
        setFilteredJobs(filtered);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters({ ...searchFilters, [name]: value });
    };

// Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5; // Number of jobs per page
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Next and Previous buttons
    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredJobs.length / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    return (
        <div className="site-wrap">
            <div className="site-mobile-menu site-navbar-target">
                <div className="site-mobile-menu-header">
                    <div className="site-mobile-menu-close mt-3">
                        <span className="icon-close2 js-menu-toggle"></span>
                    </div>
                </div>
                <div className="site-mobile-menu-body"></div>
            </div>
            {/* .site-mobile-menu */}

            {/* NAVBAR */}
            {/* NAVBAR */}
            <header className="site-navbar mt-3">
                <div className="container-fluid">
                    <div className="row align-items-center">
                        <div className="site-logo col-6">
                            <a href="/Job-BoardMain">JobBoard</a>
                        </div>

                        <nav className="mx-auto site-navigation">
                            <ul className="site-menu js-clone-nav d-none d-xl-block ml-0 pl-0">
                                <li><a href="/Job-BoardMain" className="nav-link active">Home</a></li>
                                <li><a href="/about-page">About</a></li>
                                <li className="has-children">
                                    <a href="/Post-Job">Post job</a>

                                </li>


                                <Link style={{color:'rgba(255, 255, 255, 0.5)'}} to="/list-job">
                                    <span >AI Filtering</span>
                                </Link>
                                <li><a href="/contact-us">Contact</a></li>
                                {/*<li className="d-lg-none"><a href="post-job.html"><span className="mr-2">+</span> Post a*/}
                                {/*    Job</a></li>*/}
                                {/*<li className="d-lg-none"><a href="login.html">Log In</a></li>*/}
                            </ul>
                        </nav>

                        <div className="right-cta-menu text-right d-flex align-items-center col-6">
                            <div className="ml-auto">

                                <Link to="/Post-Job"
                                      className="btn btn-outline-white border-width-2 d-none d-lg-inline-block">

                                    <span className="mr-2 icon-add">Post a Job</span>
                                </Link>

                                <Link to="/Job-Board"
                                      className="btn btn-primary border-width-2 d-none d-lg-inline-block">

                                    <span className="mr-2 icon-lock_outline">Logout</span>
                                </Link>
                            </div>
                            <a href="#"
                               className="site-menu-toggle js-menu-toggle d-inline-block d-xl-none mt-lg-2 ml-3">
                                <span className="icon-menu h3 m-0 p-0 mt-2"></span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* HOME */}
            <section
                className="home-section section-hero overlay bg-image"
                style={{backgroundImage: `url(${require('../images/hero_1.jpg')})`}}
                id="home-section"
            >

                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-md-12">
                            <div className="mb-5 text-center">
                                <h1 className="text-white font-weight-bold">The Easiest Way To Get Your Dream Job</h1>
                                {/*<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate est,*/}
                                {/*    consequuntur*/}
                                {/*    perferendis.</p>*/}
                            </div>
                            <form onSubmit={handleSearch} className="search-jobs-form">
                                <div className="row mb-5">
                                    <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4 mb-lg-0">
                                        <input
                                            type="text"
                                            name="title"
                                            value={searchFilters.title}
                                            onChange={handleInputChange}
                                            className="form-control form-control-lg"
                                            placeholder="Job title..."
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4 mb-lg-0">
                                        <input
                                            type="text"
                                            name="name"
                                            value={searchFilters.name}
                                            onChange={handleInputChange}
                                            className="form-control form-control-lg"
                                            placeholder="Applicant name..."
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4 mb-lg-0">
                                        <input
                                            type="text"
                                            name="experience"
                                            value={searchFilters.experience}
                                            onChange={handleInputChange}
                                            className="form-control form-control-lg"
                                            placeholder="Experience..."
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4 mb-lg-0">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg btn-block text-white btn-search"
                                        >
                                            <span className="icon-search icon mr-2"></span>Search
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </section>


            <section className="site-section">
                <div className="container">

                    <div className="row mb-5 justify-content-center">
                        <div className="col-md-7 text-center">
                            {/* Dynamically display the number of job postings */}
                            <h2 className="section-title mb-2">{jobApplications.length} Job Listed</h2>
                        </div>
                    </div>

                    <ul className="job-listings mb-5">
                        {currentJobs.length > 0 ? (
                            currentJobs.map((application) => (
                                <li key={application.id}
                                    className="job-listing d-block d-sm-flex pb-3 pb-sm-0 align-items-center"
                                >


                                    <div className="job-listing-logo" >
                                        <div className="job-listing-logo">
                                            <iframe
                                                src={`${application.cv}#page=1`}
                                                width="100%"
                                                height="100%"
                                                title="PDF Viewer"
                                                style={{border: "none"}}
                                            >
                                            </iframe>
                                        </div>
                                    </div>
                                    <div
                                        className="job-listing-about d-sm-flex custom-width w-100 justify-content-between mx-4">
                                        <div className="job-listing-position custom-width w-50 mb-3 mb-sm-0">
                                            <h2>{application.name}</h2>
                                            <strong>Job Title: {application.job_title}</strong>
                                        </div>
                                        <div className="job-listing-location mb-3 mb-sm-0 custom-width w-25">
                                            <span
                                                className="icon-room"></span>Experience: {application.experience || 'Unknown Experience'}
                                            <div style={{


                                                padding: '0.5em 1em'
                                            }}

                                                 className="job-listing-meta">
                                            <span
                                                style={{

                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    borderRadius: '0.25rem',
                                                    color: '#fff',
                                                    backgroundColor:
                                                        application.status === 'rejected' ? '#FF0000' :
                                                            application.status === 'pending' ? '#007bff' : '#dc3545'
                                                }}
                                                className={`badge ${application.status === 'rejected' ? 'badge-success' :
                                                    application.status === 'pending' ? 'badge-pending' : 'badge-danger'}`}>
                                                {application.status}
                                            </span>

                                            </div>

                                        </div>


                                        <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-4 mb-lg-0">
                                            <button onClick={() => handleShortlistClick(application.id)} type="submit"
                                                    className="btn btn-primary btn-lg btn-block text-white btn-search"><span
                                                className="icon-search icon mr-2"></span>Shortlist
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>No job applications available.</p>
                        )}
                    </ul>
                    <div className="row pagination-wrap">
                        <div className="col-md-6 text-center text-md-left mb-4 mb-md-0">
                            <span>
                                Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} Jobs
                            </span>
                        </div>
                        <div className="col-md-6 text-center text-md-right">
                            <div  className="custom-pagination ml-auto">
                                <button style={{backgroundColor:"#89ba16",borderRadius:"20px",margin:"5px",border:"none"}} className="prev" onClick={handlePrevPage} disabled={currentPage === 1}>
                                    Prev
                                </button>
                                {[...Array(Math.ceil(filteredJobs.length / jobsPerPage)).keys()].map((num) => (
                                    <button style={{backgroundColor:"#89ba16",borderRadius:"20px",margin:"5px",border:"none"}}
                                        key={num + 1}
                                        onClick={() => paginate(num + 1)}
                                        className={currentPage === num + 1 ? "active" : ""}
                                    >
                                        {num + 1}
                                    </button>
                                ))}
                                <button style={{backgroundColor:"#89ba16",borderRadius:"20px",margin:"5px",border:"none"}}
                                    className="next"
                                    onClick={handleNextPage}
                                    disabled={currentPage === Math.ceil(filteredJobs.length / jobsPerPage)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
            <Footer />
        </div>
    );
};
export default JobList;
