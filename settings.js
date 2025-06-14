const minDaysInput = document.getElementById("minDays");
const whitelistInput = document.getElementById("whitelist");
const saveBtn = document.getElementById("save");

// Load settings on page load
chrome.storage.sync.get(["minDays", "whitelist"], ({ minDays, whitelist }) => {
  minDaysInput.value = minDays ?? 0;
  whitelistInput.value = (whitelist ?? []).join(", ");
});

// Save settings on button click
saveBtn.addEventListener("click", () => {
  let minDays = parseInt(minDaysInput.value, 10);

  if (isNaN(minDays) || minDays < 0) {
    alert("Please enter a valid non-negative number for the days.");
    minDaysInput.focus();
    return; // Prevent saving invalid value
  }

  const whitelistRaw = whitelistInput.value;
  const whitelist = whitelistRaw
    .split(",")
    .map(u => u.trim().toLowerCase().replace(/^u\//, ""))
    .filter(Boolean);

  chrome.storage.sync.set({ minDays, whitelist }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving settings:", chrome.runtime.lastError);
      alert("Error saving settings, see console.");
    } else {
      console.log("Settings saved:", { minDays, whitelist });
      alert("Settings saved.");
    }
  });
});

