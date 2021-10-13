const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "http://localhost:3000";
const uploadURL = `${baseURL}/api/upload`;
const emailURL = `${baseURL}/api/email/send`;

const maxAllowedSize = 50 * 1024 * 1024; //50mb

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("dropped", e.dataTransfer.files[0].name);
  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 50MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
  console.log("dropping file");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
  console.log("drag ended");
});

// file input change and uploader
fileInput.addEventListener("change", () => {
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max file size is 50MB");
    fileInput.value = ""; // reset the input
    return;
  }
  uploadFile();
});

// sharing container listenrs
copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
  fileURL.select();
});

const uploadFile = async () => {
  console.log("Uploading....");
  let files = fileInput.files;
  const formData = new FormData();
  formData.append("Files", files[0]);
  formData.append("name", files[0].name);
  progressContainer.style.display = "block";
  let request = new XMLHttpRequest();
  request.open("POST", uploadURL);

  //upload progress
  request.upload.addEventListener("progress", (e) => {
    let percent = Math.round((100 * e.loaded) / e.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
    //console.log(percent);
  });

  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(request.responseText, request.status);
    }
  };

  request.upload.onerror = function () {
    showToast(`Error in upload: ${request.status}.`);
    fileInput.value = "";
  };

  request.send(formData);
};

const onFileUploadSuccess = (res, status) => {
  if (status === 200) {
    fileInput.value = ""; // reset the input
    status.innerText = "Uploaded";

    // remove the disabled attribute from form btn & make text send
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = "none"; // hide the box

    const { file: url, message: message } = JSON.parse(res);
    console.log(message);
    sharingContainer.style.display = "block";
    fileURL.value = url;
  } else {
    const { message: message } = JSON.parse(res);
    fileInput.value = "";
    status.innerText = message;
    progressContainer.style.display = "none";
    console.log(message);
  }
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop submission

  // disable the button
  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending";

  const url = fileURL.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };
  console.log(formData);
  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none"; // hide the box
      }
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        showToast("Error occurred while sending email");
        sharingContainer.style.display = "none"; // hide the box
      }
    });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
