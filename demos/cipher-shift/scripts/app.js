document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("inputText");
  const shiftKey = document.getElementById("shiftKey");
  const resultText = document.getElementById("resultText");
  const shiftedAlphabet = document.getElementById("shiftedAlphabet");
  const encodeBtn = document.getElementById("encodeBtn");
  const decodeBtn = document.getElementById("decodeBtn");
  const bruteForceBtn = document.getElementById("bruteForceBtn");
  const cryptType = document.querySelector(".Crypt-type");
  const path = document.querySelector(".clipShape path");
  const importBtn = document.getElementById("importBtn");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const copyResultBtn = document.getElementById("copyResultBtn");

  const encodePath = `M 10,60
    L 720,60 A 10,10 0,0,0 730,50
    L 730,10 A 10,10 0,0,1 740,0
    L 868.5,0 A 10,10 0,0,1 878.5,10
    L 878.5,50 A 10,10 0,0,0 888.5,60
    L 1058,60 A 10,10 0,0,1 1069,70
    L 1069,548 L 1,548 L 1,70
    A 10,10 0,0,1 11,60 Z`;
  const decodePath = `M 10,60
    L 880,60 A 10,10 0,0,0 890,50
    L 890,10 A 10,10 0,0,1 900,0
    L 1027.5,0 A 10,10 0,0,1 1037.5,10
    L 1037.5,50 A 10,10 0,0,0 1042.5,60
    L 1058,60 A 10,10 0,0,1 1069,70
    L 1069,548 L 1,548 L 1,70
    A 10,10 0,0,1 11,60 Z`;
  const encodeFill = "rgba(69,138,209,.6)";
  const decodeFill = "rgba(16,159,73,.6)";
  const encodeImportFill = "#2196f3";
  const decodeImportFill = "#109f49";

  let mode = "encode";
  let importedImage = null;
  let extractedText = "";

  const wordLibrary = [
    /* very long list removed for brevity; keeping original content */ "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "for",
    "not",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "this",
    "but",
    "his",
    "by",
    "from",
    "they",
    "we",
    "say",
    "her",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "would",
    "there",
    "their",
    "what",
    "so",
    "up",
    "out",
    "if",
    "about",
    "who",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "people",
    "into",
    "year",
    "your",
    "good",
    "some",
    "could",
    "them",
    "see",
    "other",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "its",
    "over",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
    "is",
    "am",
    "are",
    "was",
    "were",
    "been",
    "has",
    "had",
    "did",
    "made",
    "used",
    "find",
    "say",
    "told",
    "asked",
    "went",
    "came",
    "put",
    "took",
    "saw",
    "thought",
    "left",
    "right",
    "big",
    "small",
    "large",
    "young",
    "old",
    "long",
    "short",
    "great",
    "little",
    "high",
    "low",
    "early",
    "late",
    "next",
    "last",
    "good",
    "bad",
    "better",
    "best",
    "worse",
    "worst",
    "easy",
    "hard",
    "happy",
    "sad",
    "angry",
    "tired",
    "strong",
    "weak",
    "rich",
    "poor",
    "true",
    "false",
    "real",
    "same",
    "different",
    "beautiful",
    "ugly",
    "clean",
    "dirty",
    "full",
    "empty",
    "hot",
    "cold",
    "warm",
    "cool",
    "dry",
    "wet",
    "light",
    "dark",
    "heavy",
    "soft",
    "loud",
    "quiet",
    "fast",
    "slow",
    "quick",
    "bright",
    "sharp",
    "round",
    "square",
    "deep",
    "shallow",
    "sweet",
    "bitter",
    "fresh",
    "stale",
    "thick",
    "thin",
    "open",
    "closed",
    "alive",
    "dead",
    "right",
    "wrong",
    "main",
    "public",
    "private",
    "important",
    "simple",
    "complex",
    "common",
    "rare",
    "possible",
    "impossible",
    "necessary",
    "available",
    "free",
    "busy",
    "clear",
    "safe",
    "dangerous",
    "ready",
    "careful",
    "powerful",
    "successful",
    "interesting",
    "difficult",
    "popular",
    "serious",
    "special",
    "strange",
    "useful",
    "wonderful",
    "amazing",
    "natural",
    "normal",
    "traditional",
    "basic",
    "modern",
    "recent",
    "similar",
    "various",
    "whole",
    "complete",
    "major",
    "minor",
    "local",
    "global",
    "national",
    "international",
    "current",
    "future",
    "past",
    "present",
    "previous",
    "certain",
    "probable",
    "likely",
    "unlikely",
    "uncommon",
    "famous",
    "unknown",
    "known",
    "unimportant",
    "general",
    "specific",
    "restricted",
    "primary",
    "advanced",
    "sour",
    "salty",
    "tiny",
    "huge",
    "giant",
    "massive",
    "unclear",
    "hidden",
    "awake",
    "asleep",
    "cheap",
    "expensive",
    "useless",
    "funny",
    "friendly",
    "kind",
    "mean",
    "polite",
    "rude",
    "brave",
    "coward",
    "honest",
    "dishonest",
    "smart",
    "stupid",
    "clever",
    "foolish",
    "wise",
    "silly",
    "lazy",
    "active",
    "noisy",
    "peaceful",
    "violent",
    "creative",
    "boring",
    "curious",
    "careless",
    "confident",
    "nervous",
    "proud",
    "shy",
    "crazy",
    "tall",
    "fat",
    "thin",
    "healthy",
    "sick",
    "more",
    "less",
    "most",
    "least",
    "many",
    "few",
    "some",
    "none",
    "every",
    "each",
    "any",
    "all",
    "no",
    "one",
    "two",
    "three",
    "four",
    "five",
    "ten",
    "hundred",
    "thousand",
    "million",
    "billion",
    "time",
    "day",
    "week",
    "month",
    "hour",
    "minute",
    "second",
    "man",
    "woman",
    "child",
    "boy",
    "girl",
    "friend",
    "family",
    "father",
    "mother",
    "brother",
    "sister",
    "son",
    "daughter",
    "husband",
    "wife",
    "baby",
    "home",
    "house",
    "school",
    "office",
    "shop",
    "store",
    "market",
    "city",
    "town",
    "village",
    "country",
    "world",
    "earth",
    "place",
    "room",
    "door",
    "window",
    "street",
    "road",
    "car",
    "bus",
    "train",
    "plane",
    "ship",
    "boat",
    "bike",
    "food",
    "water",
    "drink",
    "bread",
    "rice",
    "fruit",
    "apple",
    "banana",
    "orange",
    "grape",
    "milk",
    "coffee",
    "tea",
    "sugar",
    "salt",
    "meat",
    "fish",
    "egg",
    "chicken",
    "beef",
    "vegetable",
    "potato",
    "tomato",
    "onion",
    "garlic",
    "pepper",
    "oil",
    "butter",
    "cheese",
    "computer",
    "phone",
    "tv",
    "radio",
    "internet",
    "game",
    "music",
    "song",
    "movie",
    "film",
    "book",
    "story",
    "news",
    "letter",
    "paper",
    "pen",
    "pencil",
    "desk",
    "chair",
    "table",
    "bed",
    "bag",
    "box",
    "wall",
    "floor",
    "ceiling",
    "fan",
    "clock",
    "watch",
    "shoe",
    "shirt",
    "pants",
    "dress",
    "hat",
    "coat",
    "ring",
    "money",
    "bank",
    "price",
    "buy",
    "sell",
    "pay",
    "job",
    "boss",
    "manager",
    "team",
    "business",
    "teacher",
    "student",
    "class",
    "lesson",
    "exam",
    "test",
    "question",
    "answer",
    "write",
    "read",
    "speak",
    "listen",
    "learn",
    "study",
    "understand",
    "remember",
    "forget",
    "believe",
    "touch",
    "taste",
    "smell",
    "love",
    "hate",
    "need",
    "send",
    "receive",
    "show",
    "start",
    "begin",
    "finish",
    "end",
    "wait",
    "stop",
    "leave",
    "arrive",
    "stay",
    "move",
    "run",
    "walk",
    "sit",
    "stand",
    "fall",
    "jump",
    "play",
    "sleep",
    "eat",
    "drive",
    "ride",
    "watch",
    "help",
    "try",
    "build",
    "create",
    "fix",
    "change",
    "lose",
    "win",
    "meet",
    "call",
    "tell",
  ];

  function normalizeTextOutput(text) {
    return text.replace(/\|/g, "I");
  }

  function caesarCipher(text, shift, encode = true) {
    if (!encode) shift = (26 - shift) % 26;
    const a = "a".charCodeAt(0),
      z = "z".charCodeAt(0),
      A = "A".charCodeAt(0),
      Z = "Z".charCodeAt(0);
    return text
      .split("")
      .map((ch) => {
        const c = ch.charCodeAt(0);
        if (c >= a && c <= z)
          return String.fromCharCode(((c - a + shift) % 26) + a);
        if (c >= A && c <= Z)
          return String.fromCharCode(((c - A + shift) % 26) + A);
        return ch;
      })
      .join("");
  }

  function updateShiftedAlphabet(shift) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const shifted = alphabet
      .split("")
      .map((ch, i) => alphabet[(i + shift) % 26])
      .join("");
    shiftedAlphabet.value = `${alphabet}\n${shifted}`;
    shiftedAlphabet.readOnly = true;
    shiftedAlphabet.style.pointerEvents = "none";
  }

  function updateResult() {
    if (mode === "bruteForce") return;
    const text = inputText.value;
    let shift = parseInt(shiftKey.value) || 0;
    shift = ((shift % 26) + 26) % 26;
    const encodeMode = mode === "encode";
    resultText.value = normalizeTextOutput(
      caesarCipher(text, shift, encodeMode)
    );
    updateShiftedAlphabet(shift);
  }

  function bruteForceDecode() {
    const text = inputText.value.trim();
    if (!text) {
      resultText.value = "Enter text to decode first.";
      return;
    }

    let bestShift = null;
    let bestScore = 0;
    let bestDecoded = "";

    for (let i = 1; i < 26; i++) {
      const decoded = caesarCipher(text, i, false);
      let score = 0;
      for (const word of wordLibrary) {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        if (regex.test(decoded)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestShift = i;
        bestDecoded = decoded;
      }
    }

    if (bestScore === 0) {
      resultText.value = "No matching words found in the library.";
      return;
    }

    mode = "bruteForce";
    cryptType.textContent = "BRUTE FORCE RESULT";
    resultText.value = `------ LIKELY SHIFT ${bestShift} ------\n\n${normalizeTextOutput(
      bestDecoded
    )}`;
    updateShiftedAlphabet(bestShift);
  }

  encodeBtn.addEventListener("click", () => {
    mode = "encode";
    cryptType.textContent = "ENCODED";
    encodeBtn.classList.add("active");
    decodeBtn.classList.remove("active");
    bruteForceBtn.style.display = "none";
    path.setAttribute("d", encodePath);
    path.setAttribute("fill", encodeFill);
    importBtn.style.backgroundColor = encodeImportFill;
    inputText.value = resultText.value = "";
    updateShiftedAlphabet(parseInt(shiftKey.value) || 0);
  });

  decodeBtn.addEventListener("click", () => {
    mode = "decode";
    cryptType.textContent = "DECODED";
    decodeBtn.classList.add("active");
    encodeBtn.classList.remove("active");
    bruteForceBtn.style.display = "block";
    path.setAttribute("d", decodePath);
    path.setAttribute("fill", decodeFill);
    importBtn.style.backgroundColor = decodeImportFill;
    inputText.value = resultText.value = shiftKey.value = "";
    updateShiftedAlphabet(parseInt(shiftKey.value) || 0);
  });

  bruteForceBtn.addEventListener("click", bruteForceDecode);

  inputText.addEventListener("input", updateResult);
  inputText.addEventListener("input", () => {
    // If brute force was used earlier, reset everything
    if (mode === "bruteForce") {
      mode = "decode";
      cryptType.textContent = "DECODED";
      resultText.value = "";
      shiftKey.value = "";
    }
    updateResult();
  });

  shiftKey.addEventListener("input", updateResult);

  importBtn.addEventListener("click", () => {
    if (importBtn.textContent === "Copy Text") {
      navigator.clipboard.writeText(extractedText).then(() => {
        importBtn.textContent = "Copied!";
        setTimeout(() => {
          importBtn.textContent = "Import Image";
          imagePreview.innerHTML = "";
          imageInput.value = "";
          extractedText = "";
          importedImage = null;
        }, 1500);
      });
    } else {
      imageInput.click();
    }
  });

  imageInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      importedImage = e.target.result;
      imagePreview.innerHTML = `<img src="${importedImage}" alt="Imported Image">`;
      importBtn.disabled = true;
      importBtn.textContent = "Processing...";

      Tesseract.recognize(importedImage, "eng", {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          extractedText = normalizeTextOutput(text.trim());
          if (extractedText) {
            importBtn.textContent = "Copy Text";
          } else {
            importBtn.textContent = "No Text Found";
            setTimeout(() => (importBtn.textContent = "Import Image"), 2000);
          }
        })
        .catch((err) => {
          console.error(err);
          importBtn.textContent = "Import Failed";
          setTimeout(() => (importBtn.textContent = "Import Image"), 2000);
        })
        .finally(() => {
          importBtn.disabled = false;
        });
    };
    reader.readAsDataURL(file);
  });

  copyResultBtn.addEventListener("click", async () => {
    let text = resultText.value.trim();
    if (!text) return;

    if (text.includes("------ LIKELY SHIFT")) {
      const parts = text.split("\n\n");
      if (parts.length > 1) text = parts.slice(1).join("\n\n").trim();
    }

    try {
      await navigator.clipboard.writeText(text);
      copyResultBtn.textContent = "COPIED";
      setTimeout(() => (copyResultBtn.textContent = "COPY"), 1500);
    } catch {
      alert("Copy failed — your browser may block clipboard access.");
    }
  });

  updateShiftedAlphabet(0);
});
