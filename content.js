async function getSettings() {
  return new Promise(resolve =>
    chrome.storage.sync.get(["minDays", "whitelist"], ({ minDays, whitelist }) =>
      resolve({ minDays: minDays ?? 0, whitelist: (whitelist ?? []).map(u => u.toLowerCase()) })
    )
  );
}

async function fetchAccountAge(username) {
  try {
    const resp = await fetch(`https://www.reddit.com/user/${username}/about.json`);
    if (!resp.ok) return null;
    const data = await resp.json();
    const created = data.data?.created_utc;
    if (!created) return null;
    return (Date.now() / 1000 - created) / 86400;
  } catch (e) {
    console.error("Failed to fetch account age for", username, e);
    return null;
  }
}

function getAuthorElements() {
  const authors = [];
  const links = document.querySelectorAll("a[href^='/user/'], a[href*='reddit.com/user/']");

  links.forEach(link => {
    const match = link.href.match(/\/user\/([^/?#]+)/i);
    if (match) {
      const username = match[1];
      if (!username.toLowerCase().includes("mod")) {
        authors.push({ username: username.toLowerCase(), element: link });
      }
    }
  });

  return authors;
}

setTimeout(async () => {
  const { minDays: threshold, whitelist } = await getSettings();
  console.log("Threshold is:", threshold);
  console.log("Whitelist:", whitelist);

  const authors = getAuthorElements();

  for (const { username, element } of authors) {
    if (whitelist.includes(username)) {
      console.log(`→ Whitelisted user: ${username}`);
      continue;
    }

    const age = await fetchAccountAge(username);
    console.log(`User ${username} is ${Math.round(age)} days old (threshold = ${threshold})`);
    if (age !== null && age < threshold) {
      const container =
        element.closest("div[class*='Comment']") ||
        element.closest("shreddit-comment") ||
        element.closest("div[data-testid='comment']") ||
        element.closest("div[data-testid='post-container']");

      console.log("→ Found container for", username, ":", container);

      if (container) {
        const placeholder = document.createElement("div");
        placeholder.style.cssText = `
          padding: 1em;
          margin: 0.5em 0;
          background: #2d2d2d;
          border-left: 4px solid #f00;
          color: #aaa;
          font-style: italic;
        `;
        placeholder.textContent = `Comment hidden (account < ${threshold} days). Click to show.`;
        placeholder.style.cursor = "pointer";

        placeholder.addEventListener("click", () => {
          placeholder.replaceWith(container);
        });

        container.replaceWith(placeholder);
        console.log(`🔴 Hiding comment/post by ${username}`);
      } else {
        console.log("→ No container found for", username);
      }
    } else {
      console.log(`→ Will NOT hide user: ${username}`);
    }
  }
}, 2000);
