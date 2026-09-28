const state = { internships: [] };
const cards = document.querySelector("#cards");
const loading = document.querySelector("#loading");
const failure = document.querySelector("#failure");
const empty = document.querySelector("#empty");
const search = document.querySelector("#search");
const domain = document.querySelector("#domain");
const internshipId = document.querySelector("#internshipId");
const form = document.querySelector("#applicationForm");
const formMessage = document.querySelector("#formMessage");

async function loadInternships() {
  loading.hidden = false; failure.hidden = true; empty.hidden = true; cards.innerHTML = "";
  try {
    const response = await fetch("/api/internships");
    if (!response.ok) throw new Error("API request failed");
    const body = await response.json();
    state.internships = body.data || [];
    populateDomains();
    populateInternships();
    render();
  } catch (error) {
    loading.hidden = true; failure.hidden = false;
  }
}

function populateDomains() {
  const current = domain.value;
  domain.innerHTML = '<option value="">All domains</option>';
  [...new Set(state.internships.map(i => i.domain))].forEach(value => {
    const option = document.createElement("option");
    option.value = value; option.textContent = value; domain.appendChild(option);
  });
  domain.value = current;
}

function populateInternships() {
  internshipId.innerHTML = '<option value="">Select an internship</option>';
  state.internships.forEach(i => {
    const option = document.createElement("option");
    option.value = i.id; option.textContent = `${i.title} — ${i.company}`;
    internshipId.appendChild(option);
  });
}

function render() {
  loading.hidden = true;
  const q = search.value.trim().toLowerCase();
  const d = domain.value;
  const rows = state.internships.filter(i =>
    (!q || `${i.title} ${i.company} ${i.description}`.toLowerCase().includes(q)) &&
    (!d || i.domain === d)
  );
  cards.innerHTML = "";
  empty.hidden = rows.length !== 0;
  rows.forEach(i => {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `<h3>${escapeHtml(i.title)}</h3>
      <div class="company">${escapeHtml(i.company)}</div>
      <div class="tags"><span class="tag">${escapeHtml(i.domain)}</span><span class="tag">${escapeHtml(i.location)}</span><span class="tag">${escapeHtml(i.level)}</span></div>
      <p>${escapeHtml(i.description)}</p>
      <button type="button" data-id="${i.id}">Apply now</button>`;
    cards.appendChild(article);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

search.addEventListener("input", render);
domain.addEventListener("change", render);
document.querySelector("#reload").addEventListener("click", loadInternships);
cards.addEventListener("click", e => {
  if (e.target.matches("button[data-id]")) {
    internshipId.value = e.target.dataset.id;
    document.querySelector("#applicationForm").scrollIntoView({behavior:"smooth"});
    document.querySelector("#name").focus();
  }
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  formMessage.textContent = "";
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const payload = {
    internshipId: Number(internshipId.value),
    name: document.querySelector("#name").value.trim(),
    email: document.querySelector("#email").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    coverLetter: document.querySelector("#coverLetter").value.trim()
  };
  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.details ? body.details.join(", ") : body.error);
    formMessage.textContent = `✓ ${body.message}`;
    form.reset();
  } catch (error) {
    formMessage.textContent = `✕ ${error.message}`;
  }
});

loadInternships();
