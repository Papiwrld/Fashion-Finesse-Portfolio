// fashion-finesse.js

// Welcome message when the page loads
window.onload = function () {
  alert("Welcome to Fashion Finesse! Explore our latest fashion trends.");
};

// Show "Back to Top" button when scrolling
window.onscroll = function () {
  toggleBackToTopButton();
};

function toggleBackToTopButton() {
  const backToTopButton = document.getElementById("backToTop");
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}

// Scroll back to the top when "Back to Top" button is clicked
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
