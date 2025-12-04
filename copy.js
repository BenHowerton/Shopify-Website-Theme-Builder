document.addEventListener("DOMContentLoaded", function () {
  function copyURI(event) {
    event.preventDefault();
    navigator.clipboard.writeText(window.location.href);

    const shareButton = event.currentTarget;
  
    if (shareButton && !shareButton.classList.contains("success")) {
      shareButton.classList.add("success");
  
      setTimeout(() => {
        shareButton.classList.remove("success");
      }, 2000);
    }
  }

  document.querySelectorAll(".copy-btn").forEach((copyLink) => {
    copyLink.addEventListener("click", copyURI);
  });
});
