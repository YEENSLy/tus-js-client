/* global tus */

var upload          = null;
var uploadIsRunning = false;

var uploadButton = document.querySelector("#js-upload-button");
var fileInput    = document.querySelector("#js-upload-file");
var progressBar  = document.querySelector("#js-upload-progress");
var progressText = document.querySelector("#js-upload-progress-text");
var uploadLink   = document.querySelector("#js-upload-link");

fileInput.addEventListener("change", resetUpload);

function resetUpload() {
    if (upload) {
        upload.abort();
        upload = null;
    }

    uploadButton.textContent = "Start Upload";
    uploadLink.textContent = "not available yet";
    progressText.textContent = "";
    progressBar.removeAttribute("value");
}

uploadButton.addEventListener("click", toggleUpload);

function toggleUpload() {
    if (!upload) {
        // No upload started yet, so we create one
        var file = fileInput.files[0];
        if (!file) return;
 
        var options = {
        endpoint: "https://master.tus.io/files/",
        resume  : false,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: file.name,
          filetype: file.type
        },
        onError : function (error) {
          if (error.originalRequest) {
            if (window.confirm("Failed because: " + error + "\nDo you want to retry?")) {
              upload.start();
              uploadIsRunning = true;
              return;
            }
          } else {
            window.alert("Failed because: " + error);
          }

          resetUpload();
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          var progress = bytesUploaded / bytesTotal;
          var percentage = (progress * 100).toFixed(2) + "%";
          progressBar.value = progress;
          progressText.textContent = percentage;
        },
        onSuccess: function () {
          var anchor = document.createElement("a");
          anchor.textContent = "Download " + upload.file.name + " (" + upload.file.size + " bytes)";
          anchor.target = "_blank";
          anchor.href = upload.url;

          uploadLink.innerHTML = "";
          uploadLink.appendChild(anchor);
        }
        };

        upload = new tus.Upload(file, options);

        upload.start();
        uploadIsRunning = true;
        uploadButton.textContent = "Pause Upload";

    } else {
        if (uploadIsRunning) {
            upload.abort();
            uploadButton.textContent = "Resume Upload";
            uploadIsRunning = false;
        } else {
            upload.start();
            uploadButton.textContent = "Pause Upload";
            uploadIsRunning = true;
        }
    }
}
