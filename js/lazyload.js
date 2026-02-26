document.addEventListener("DOMContentLoaded", function() {
  // Grab all videos with the 'lazy-video' class
  let lazyVideos = [].slice.call(document.querySelectorAll("video.lazy-video"));

  // Check if the browser supports Intersection Observer
  if ("IntersectionObserver" in window) {
    let lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(video) {
        // If the video is scrolling into view
        if (video.isIntersecting) {
          // Find the <source> tags and swap data-src to src
          for (let source in video.target.children) {
            let videoSource = video.target.children[source];
            if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
              videoSource.src = videoSource.dataset.src;
            }
          }
          // Load and play the video
          video.target.load();
          video.target.play();
          
          // Stop observing this video once it's loaded
          lazyVideoObserver.unobserve(video.target);
        }
      });
    });

    // Start observing each video
    lazyVideos.forEach(function(lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
});