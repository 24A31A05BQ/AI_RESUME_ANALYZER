// FILE UPLOAD (TXT + PDF + DOCX)

document.getElementById("fileInput").addEventListener("change", function () {

  let file = this.files[0];
  if (!file) return;

  let type = file.name.split(".").pop().toLowerCase();

  // TXT
  if (type === "txt") {
    let reader = new FileReader();
    reader.onload = e => {
      document.getElementById("resume").value = e.target.result;
    };
    reader.readAsText(file);
  }

  // PDF
  else if (type === "pdf") {
    let reader = new FileReader();

    reader.onload = function () {
      let typedarray = new Uint8Array(this.result);

      pdfjsLib.getDocument(typedarray).promise.then(pdf => {

        let text = "";
        let total = pdf.numPages;
        let count = 0;

        for (let i = 1; i <= total; i++) {
          pdf.getPage(i).then(page => {
            page.getTextContent().then(content => {

              content.items.forEach(item => {
                text += item.str + " ";
              });

              count++;
              if (count === total) {
                document.getElementById("resume").value = text;
              }

            });
          });
        }

      });
    };

    reader.readAsArrayBuffer(file);
  }

  // DOCX
  else if (type === "docx") {
    let reader = new FileReader();

    reader.onload = function (event) {
      mammoth.extractRawText({ arrayBuffer: event.target.result })
        .then(result => {
          document.getElementById("resume").value = result.value;
        })
        .catch(() => alert("Error reading DOCX"));
    };

    reader.readAsArrayBuffer(file);
  }

  else {
    alert("Unsupported file type");
  }
});


// ANALYSIS FUNCTION

function analyzeResume() {

  let text = document.getElementById("resume").value.toLowerCase();
  let role = document.getElementById("role").value;
  let output = document.getElementById("output");

  if (!text || !role) {
    output.innerHTML = "<p>Please enter resume and select role</p>";
    return;
  }

  let skills = {
    web: ["html","css","javascript","react","node"],
    data: ["python","sql","excel","powerbi"],
    software: ["java","dsa","oops","dbms"]
  };

  let required = skills[role];

  let found = [];
  let missing = [];

  required.forEach(skill => {
    if (text.includes(skill)) found.push(skill);
    else missing.push(skill);
  });

  let score = Math.round((found.length / required.length) * 100);

  let level = score < 40 ? "⚠️ Needs Improvement"
            : score < 70 ? "👍 Average Profile"
            : "🔥 Strong Resume";

  let suggestion = `You are missing ${missing.join(", ")}. Focus on learning these skills.`;

  let roleAdvice = role === "web"
    ? "Build frontend + backend projects using React and Node."
    : role === "data"
    ? "Work on data analysis projects using Python, SQL, and PowerBI."
    : "Practice DSA and build strong core programming concepts.";

  output.innerHTML = `
    <h3>📊 Resume Analysis Result</h3>

    <p><strong>Selected Role:</strong> ${role.toUpperCase()}</p>

    <p><strong>🎯 Score:</strong> ${score}/100</p>

    <div class="progress">
      <div class="progress-bar" style="width:${score}%">${score}%</div>
    </div>

    <p><strong>📈 Level:</strong> ${level}</p>

    <p><strong>✅ Matched Skills:</strong> 
      <span class="found">${found.join(", ") || "None"}</span>
    </p>

    <p><strong>❌ Missing Skills:</strong> 
      <span class="missing">${missing.join(", ")}</span>
    </p>

    <p><strong>💡 Suggestion:</strong> ${suggestion}</p>

    <p><strong>🎯 Role Advice:</strong> ${roleAdvice}</p>

    <p><strong>🤖 AI Insight:</strong> Your resume matches ${score}% of industry expectations.</p>
  `;
}