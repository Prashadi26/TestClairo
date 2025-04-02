import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSlider.css";

const LanguageSlider = () => {
  const { i18n } = useTranslation();

  const languages = useMemo(
    () => [
      { code: "en", name: "EN" },
      { code: "ta", name: "TA" },
      { code: "si", name: "SI" },
    ],
    []
  );

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentIndex = useMemo(() => {
    return languages.findIndex((lang) => lang.code === i18n.language) || 0;
  }, [i18n.language, languages]);

  return (
    <div className="language-slider">
      <div className="slider-track">
        {languages.map((language) => (
          <button
            key={language.code}
            className={`slider-option ${
              i18n.language === language.code ? "active" : ""
            }`}
            onClick={() => changeLanguage(language.code)}
            aria-pressed={i18n.language === language.code}
          >
            {language.name}
          </button>
        ))}
        <div
          className="slider-indicator"
          style={{ transform: `translateX(${getCurrentIndex * 100}%)` }}
        ></div>
      </div>
    </div>
  );
};

export default React.memo(LanguageSlider);
