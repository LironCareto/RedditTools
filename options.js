document.addEventListener("DOMContentLoaded", () => {
  const daysInput = document.getElementById("days");

  chrome.storage.sync.get(["minDays"], ({ minDays }) => {
    daysInput.value = minDays ?? 0;
  });

  document.getElementById("save").addEventListener("click", () => {
    chrome.storage.sync.set({ minDays: parseInt(daysInput.value || "0") });
        window.close();
  });
});
