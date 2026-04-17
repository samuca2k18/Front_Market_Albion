// src/pages/DataClientPage.tsx
import { useTranslation } from "react-i18next";
import { Download, Heart } from "lucide-react";
import "./DataClientPage.css";

const SERVERS = [
    { flag: "🌍", label: "Europe", users: "~350", level: "medium" },
    { flag: "🌎", label: "Americas", users: "~420", level: "medium" },
    { flag: "🌏", label: "Asia", users: "~180", level: "low" },
];

const WHY_CARDS = [
    {
        icon: "⚡",
        titleKey: "dataClient.why1Title",
        descKey: "dataClient.why1Desc",
    },
    {
        icon: "🗺️",
        titleKey: "dataClient.why2Title",
        descKey: "dataClient.why2Desc",
    },
    {
        icon: "🤝",
        titleKey: "dataClient.why3Title",
        descKey: "dataClient.why3Desc",
    },
];

export function DataClientPage() {
    const { t } = useTranslation();

    const steps = [
        {
            n: 1,
            title: t("dataClient.step1Title"),
            desc: t("dataClient.step1Desc"),
        },
        {
            n: 2,
            title: t("dataClient.step2Title"),
            desc: t("dataClient.step2Desc"),
        },
        {
            n: 3,
            title: t("dataClient.step3Title"),
            desc: t("dataClient.step3Desc"),
        },
        {
            n: 4,
            title: t("dataClient.step4Title"),
            desc: t("dataClient.step4Desc"),
        },
    ];

    return (
        <div className="dataclient-page">
            <div className="app-container">

                {/* Hero */}
                <div className="dataclient-hero">
                    <div className="dataclient-badge">
                        <Heart size={12} />
                        {t("dataClient.badge")}
                    </div>
                    <h1>{t("dataClient.heroTitle")}</h1>
                    <p>{t("dataClient.heroDesc")}</p>
                </div>

                {/* Stats por servidor */}
                <div className="dataclient-stats">
                    {SERVERS.map((s) => (
                        <div key={s.label} className="dataclient-stat-card">
                            <span className="stat-flag">{s.flag}</span>
                            <span className="stat-label">{s.label}</span>
                            <span className={`stat-value ${s.level}`}>{s.users}</span>
                            <span className="stat-label" style={{ marginTop: "0.25rem" }}>
                                {t("dataClient.activeClients")}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Por que contribuir */}
                <div className="dataclient-why">
                    <h2 className="dataclient-section-title">
                        {t("dataClient.whyTitle")}
                    </h2>
                    <div className="dataclient-why-grid">
                        {WHY_CARDS.map((c) => (
                            <div key={c.titleKey} className="why-card">
                                <span className="why-icon">{c.icon}</span>
                                <h3>{t(c.titleKey)}</h3>
                                <p>{t(c.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Passos de instalação */}
                <div className="dataclient-steps">
                    <h2 className="dataclient-section-title">
                        {t("dataClient.stepsTitle")}
                    </h2>
                    <div className="steps-list">
                        {steps.map((step) => (
                            <div key={step.n} className="step-item">
                                <div className="step-number">{step.n}</div>
                                <div className="step-content">
                                    <h4>{step.title}</h4>
                                    <p>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="dataclient-cta">
                    <a
                        href="https://www.albion-online-data.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-btn"
                    >
                        <Download size={18} />
                        {t("dataClient.ctaBtn")}
                    </a>
                    <p>{t("dataClient.ctaNote")}</p>
                </div>

            </div>
        </div>
    );
}
