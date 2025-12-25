import React from 'react';
import { X, ShieldCheck, FileText, Lock, Globe } from 'lucide-react';

const LegalDocs = ({ activeDoc, onClose }) => {
    if (!activeDoc) return null;

    const renderContent = () => {
        switch (activeDoc) {
            case 'terms':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileText className="text-financial-green" /> Terms & Conditions
                        </h2>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">1. Nature of Service</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Smart Saving Bank is a Decentralized Finance (DeFi) application operating on the <strong>Prize-Linked Savings (PLS)</strong> model.
                                It is strictly a savings promotion protocol and <strong>does not</strong> constitute a lottery, gambling, or betting platform.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">2. Capital Protection</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                User deposits ("Principal") are <strong>100% capital-protected</strong>. The protocol does not utilize user principal for speculative trading or risk-based wagering.
                                Funds are routed to the Aave Liquidity Protocol (audited third-party) to generate safe, stable yields.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">3. Reward Mechanism</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                The "Incentive Program" distributes the <strong>accrued interest (yield)</strong> generated from the pooled funds.
                                Users do not pay for entry tickets; their participation is validated by their savings balance.
                                Winners are selected using Chainlink VRF (Verifiable Random Function) to ensure audit-able fairness.
                            </p>
                        </section>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lock className="text-blue-400" /> Privacy Policy
                        </h2>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">1. Data Minimization</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                As a Web3-native application, we recognize the importance of privacy.
                                <strong>We do not collect, store, or process personal identifiers</strong> such as names, email addresses, phone numbers, or physical addresses.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">2. Wallet Addresses</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                The only data point utilized is your public Polygon Wallet Address. This is used solely to authenticate ownership of funds and route withdrawal requests.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">3. Blockchain Transparency</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                All transactions (deposits, withdrawals, and reward distributions) are recorded publicly on the Polygon Blockchain.
                                Please be aware that while your identity is pseudonymous, your transaction history is publicly verifiable.
                            </p>
                        </section>
                    </div>
                );

            case 'refund':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" /> Refund & Withdrawal Policy
                        </h2>

                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                            <p className="text-emerald-400 text-sm font-bold text-center">
                                Your Principal Balance is Available for Withdrawal 24/7.
                            </p>
                        </div>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">1. Instant Liquidity</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Users retain 100% ownership of their deposited principal. You may withdraw your full balance at any time through the "Withdraw" interface.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">2. No Locking Period</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                There are <strong>no lock-in periods</strong>, minimum commitment durations, or early withdrawal penalties.
                                You are free to exit the savings protocol whenever you choose.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">3. Processing Time</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Withdrawals are executed directly via the Smart Contract.
                                Funds are typically transferred to your wallet within seconds, depending on Polygon network congestion.
                            </p>
                        </section>
                    </div>
                );

            case 'contact':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Globe className="text-indigo-400" /> Contact & Support
                        </h2>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">Support Channels</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                For technical assistance regarding smart contract interactions or UI feedback, please contact our support team.
                            </p>

                            <div className="bg-slate-800 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Official Email</span>
                                    <a href="mailto:support@smartsavingbank.com" className="text-financial-green font-mono text-sm hover:underline">
                                        support@smartsavingbank.com
                                    </a>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Response Time</span>
                                    <span className="text-white text-sm">Within 24 Hours</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Join our decentralized community for protocol governance updates and transparency reports.
                                <br />
                                <span className="text-slate-500 italic">(Community links will be listed here)</span>
                            </p>
                        </section>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-0 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">

                {/* Header Bar */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Legal Verification</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer Bar */}
                <div className="p-4 border-t border-white/5 bg-slate-950/50 text-center">
                    <p className="text-[10px] text-slate-600">
                        Smart Saving Bank • Built on Polygon • Non-Custodial Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalDocs;
