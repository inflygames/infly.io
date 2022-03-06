// ==UserScript==
// @name         TikTok成本设为4位小数
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Zhuo Wenli
// @match        https://ads.tiktok.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    setInterval(() => {
        const headers = document.querySelectorAll('.vi-table__header-wrapper th');
        let indexCount = 0;
        let indexRev = 0;
        let indexCost = 0;
        let indexROI = 0;
        let indexName = 0;

        if(!headers.length) return;

        [...headers].find($th => {
            const index = [...headers].indexOf($th);
            const text = $th.innerText;
            if(/^转化数/.test(text)) indexCount = index;
            if(/^转化成本/.test(text)) indexCost = index;
            if(/^总消耗/.test(text)) indexRev = index;
            if(/^名称/.test(text)) indexName = index;
            if (/i18n\/perf\/adgroup/.test(window.location.href)) {
                if(/^投放时间|投放ROI/.test(text)) {
                    indexROI = index;
                    $th.querySelector('.flex-row').innerText = '投放ROI';
                }
            }
            if (/i18n\/perf\/campaign/.test(window.location.href)) {
                if(/^CPC|投放ROI/.test(text)) {
                    indexROI = index;
                    $th.querySelector('.flex-row').innerText = '投放ROI';
                }
            }
        });

        if(!indexCost || !indexRev || !indexCost) return;

        const arpus = {
            US: 0.3808,
            VN: 0.0384,
            ID: 0.0267,
            GB: 0.1611,
            TH: 0.0460,
            TW: 0.2486,
            SG: 0.0572,
            PH: 0.0359,
            JP: 0.5760,
            KR: 0.1873,
            KH: 0.0328,
            MY: 0.0467,
        };

        const bodys = document.querySelectorAll('.vi-table__body-wrapper tr');

        bodys.forEach($tr => {
            const count = Number($tr.children[indexCount].innerText.replace(/,/, ''));
            const rev = Number($tr.children[indexRev].innerText.replace(/[,\sUSD]/g, ''));
            const $costHtml = $tr.children[indexCost].querySelector('.main-status')
            const cost = (rev / count).toFixed(4);
            $costHtml.innerText = `${cost} USD`;
            let name = '';
            let $roiHtml = null;

            if (/i18n\/perf\/adgroup/.test(window.location.href)) {
                name = $tr.children[2].querySelector('.label-content').innerText;
                $roiHtml = $tr.children[indexROI].querySelector('.cell')
            }
            if (/i18n\/perf\/campaign/.test(window.location.href)) {
                name = $tr.children[2].querySelector('.label-content').innerText;
                $roiHtml = $tr.children[indexROI].querySelector('.cell')
            }

            const countrys = name.replace(/BID_/, '').match(/(VN|ID|US|IN|GB|TH|TW|SG|PH|JP|KR|KH|MY)/);
            if (name && $roiHtml && countrys && countrys.length) {
                const country = countrys[0];
                const arpu = arpus[country];
                const roi = Number(cost) ? ((arpu / cost) * 100).toFixed(2) : 0;

                if (roi < 50) {
                    $roiHtml.innerHTML = `<span style="color: #d92424; font-weight: bold;">⚠️ ${roi}%</span>`;
                } else if (roi < 80) {
                    $roiHtml.innerHTML = `<span style="color: #d92424">⚠️ ${roi}%</span>`;
                } else if(roi > 150) {
                    $roiHtml.innerHTML = `<span style="color: #24d924">${roi}%</span>`;
                } else {
                    $roiHtml.innerHTML = `<span>${roi}%</span>`;
                }
            } else {
                $roiHtml.innerText = '-';
            }
        });

        const footers = document.querySelectorAll('.vi-table__footer-wrapper tr');

        footers.forEach($tr => {
            const count = Number($tr.children[indexCount - 2].innerText.replace(/,/, ''));
            const rev = Number($tr.children[indexRev - 2].innerText.replace(/[,\sUSD]/g, ''));
            const $costHtml = $tr.children[indexCost - 2];
            $costHtml.innerText = `${(rev / count).toFixed(4)} USD`;
        });
    }, 5000);
})();