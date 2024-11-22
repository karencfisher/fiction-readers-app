import { useState, useEffect } from "react";
import './Tabs.css';

export function Tabs(props) {
    const [currentTab, setCurrentTab] = useState(0);
    const {tabLabels, tabContents} = props;

    function changeTab(e) {
        const label = e.target.innerText;
        setCurrentTab(tabLabels.indexOf(label));
    }

    return (
        <div className="tab-container">
            <div className="tab">
                {tabLabels.map((tabLabel, i) => (
                    <button key={i} className="tablinks" onClick={changeTab}
                            data-active={currentTab === i ? 'true' : 'false'}>
                        {tabLabel}
                    </button>
                ))}
            </div>
            {tabContents.map((tabContent, i) => (
                <div key={i}  className="tab-content" data-open={currentTab === i ? 'true' : 'false'}>
                    {tabContent}
                </div>
            ))}
        </div>
    )
}