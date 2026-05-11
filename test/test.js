fetch('https://docs.google.com/document/d/1sElbGbpXAX1VjE1Yi-iSkn152asdpYRcN-USUzKJn9M/export?format=html')
  .then(res => res.text())
  .then(text => {
    console.log(text);
});