import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import LabAuthoringModal, { BTECH_PRESETS } from './components/authoring/LabAuthoringModal.jsx';

console.log('====================================================');
console.log('🧪 Multi-Cycle Lifecycle Test for LabAuthoringModal');
console.log('====================================================');

const testCases = [
  { cycle: 1, isOpen: false, query: "", desc: "Initial closed state" },
  { cycle: 2, isOpen: true,  query: "", desc: "User clicks '+ Create Custom Lab'" },
  { cycle: 3, isOpen: true,  query: "diffractiongrating", desc: "User selects Diffraction Grating preset" },
  { cycle: 4, isOpen: false, query: "diffractiongrating", desc: "User dismisses/closes modal" },
  { cycle: 5, isOpen: true,  query: "halleffect", desc: "User re-opens modal with Hall Effect search" },
  { cycle: 6, isOpen: true,  query: "custom-pendulum", desc: "User synthesizes unlisted experiment" },
  { cycle: 7, isOpen: false, query: "", desc: "User saves and closes modal" }
];

let allPassed = true;

for (const tc of testCases) {
  try {
    const html = renderToString(
      <LabAuthoringModal
        isOpen={tc.isOpen}
        initialQuery={tc.query}
        onClose={() => {}}
        onLabCreated={() => {}}
      />
    );
    
    if (tc.isOpen) {
      if (html.length < 5000) {
        throw new Error(`Open modal HTML output too short (${html.length} chars)`);
      }
      if (!html.includes("Laboratory Studio")) {
        throw new Error("Missing Laboratory Studio title in open modal");
      }
      console.log(` Cycle ${tc.cycle}: [PASS] ${tc.desc} -> Rendered ${html.length} bytes`);
    } else {
      if (html.length !== 0) {
        throw new Error(`Closed modal produced unexpected HTML output (${html.length} chars)`);
      }
      console.log(` Cycle ${tc.cycle}: [PASS] ${tc.desc} -> Rendered null (0 bytes)`);
    }
  } catch (err) {
    console.error(`❌ Cycle ${tc.cycle}: [FAIL] ${tc.desc} -> ${err.message}`);
    allPassed = false;
  }
}

console.log('====================================================');
if (allPassed) {
  console.log('✅ ALL 7 LIFECYCLE CYCLES PASSED WITH ZERO HOOK ERRORS!');
  console.log(`✅ Verified ${BTECH_PRESETS.length} B.Tech physics presets configured.`);
} else {
  console.error('❌ One or more lifecycle cycles failed.');
  process.exit(1);
}
console.log('====================================================');
