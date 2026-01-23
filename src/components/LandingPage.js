import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, Lock, Users, ChevronRight, Database, User } from 'lucide-react';

const LandingPage = ({ connectAsAdmin }) => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                <motion.div
                    className="text-center space-y-8"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="inline-block p-2 bg-blue-100/50 rounded-2xl mb-4">
                        <span className="text-blue-600 font-semibold px-4 py-1">Next Gen Healthcare</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
                        Secure Medical Records <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            On The Blockchain
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Your health data, fully encrypted and 100% under your control.
                        Share with doctors instantly and securely using blockchain technology.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button
                            onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:scale-105"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/research')}
                            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all hover:scale-105"
                        >
                            For Researchers
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="bg-white/50 backdrop-blur-sm py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <Shield className="w-8 h-8 text-blue-600" />,
                                title: "Bank-Grade Security",
                                desc: "Your records are encrypted and stored on IPFS, secured by Ethereum smart contracts."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-purple-600" />,
                                title: "Patient Controlled",
                                desc: "You decide who sees your data and for how long. Revoke access instantly."
                            },
                            {
                                icon: <Activity className="w-8 h-8 text-green-600" />,
                                title: "Universal Access",
                                desc: "Access your medical history from anywhere, anytime. No more lost files."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="p-3 bg-gray-50 rounded-xl w-fit mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Role Selection Section */}
            <div id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Portal</h2>
                    <p className="text-xl text-gray-600">Secure access for every stakeholder in the healthcare ecosystem</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                    {/* Patient Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all cursor-pointer"
                        onClick={() => navigate('/patient-login')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl w-fit group-hover:bg-blue-100 transition-colors">
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Patient</h3>
                        <p className="text-gray-500 mb-6">Manage your records and control access permissions.</p>
                        <div className="flex items-center text-blue-600 font-medium">
                            Login as Patient <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>

                    {/* Doctor Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all cursor-pointer"
                        onClick={() => navigate('/doctor-login')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-6 p-4 bg-green-50 rounded-xl w-fit group-hover:bg-green-100 transition-colors">
                            <Activity className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Doctor</h3>
                        <p className="text-gray-500 mb-6">View patient records and update medical history.</p>
                        <div className="flex items-center text-green-600 font-medium">
                            Login as Doctor <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>

                    {/* Researcher Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all cursor-pointer"
                        onClick={() => navigate('/researcher-login')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl w-fit group-hover:bg-purple-100 transition-colors">
                            <Database className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Researcher</h3>
                        <p className="text-gray-500 mb-6">Access anonymized data for medical research.</p>
                        <div className="flex items-center text-purple-600 font-medium">
                            Access Portal <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>

                    {/* Insurance Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer"
                        onClick={() => navigate('/insurance-login')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-6 p-4 bg-emerald-50 rounded-xl w-fit group-hover:bg-emerald-100 transition-colors">
                            <Shield className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Insurance</h3>
                        <p className="text-gray-500 mb-6">Verify treatments and process claims securely.</p>
                        <div className="flex items-center text-emerald-600 font-medium">
                            Login as Insurer <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>

                    {/* Admin Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-400 transition-all cursor-pointer"
                        onClick={connectAsAdmin}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl w-fit group-hover:bg-gray-100 transition-colors">
                            <Lock className="w-8 h-8 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Admin</h3>
                        <p className="text-gray-500 mb-6">System configuration and user management.</p>
                        <div className="flex items-center text-gray-700 font-medium">
                            Admin Access <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                    <p>© 2024 MedBlock. Secured by Ethereum Blockchain.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
