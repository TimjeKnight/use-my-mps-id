// Faq.tsx
function Faq() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Frequently Asked Questions</h1>
      <p><strong>What does this site do?</strong><br />
      This gives you an AI-generated mock driving licence for your MP based on public data. 
      This is useful given the recent Online Safety Act would otherwise require you to send your ID to a foreign identity checking service, or send your internet traffic a dodgy foreign VPN.
      Here's a third option! Use a mock of your local MP's ID. </p>

      <p><strong>Is this illegal?</strong><br />
      I'm not a lawyer, but this is a parody site. It's using publicly available data about your MP. The ID number isn't valid and you can't use the card for anything real.
      </p>

           <p><strong>Why have you done this?</strong><br />
     The online safety act is a terrible piece of legislation that makes the internet worse for everyone. 
     Specifically, it's already being used to block people from accessing LGBTQ+ resources, sex education resources, substance addiction resources and anti-war information. 
     When the inevitable happens and the data is all leaked, let's make sure that yours isn't in there.
      </p> 

            <p><strong>Why is it taking so long to show me an ID?</strong><br />
      If this is the first time someone has asked for this MP, we'll need to generate a new MP ID using AI, which takes about a minute. <a href="https://www.buymeacoffee.com/timje" target="_blank" rel="noopener noreferrer">It's also expensive.</a></p>

            <p><strong>Who are you?</strong><br />
      I'm Timje, a software developer who is concerned about the Online Safety Act and its implications for privacy and security online.
      Harass me at feedback.timje@gmail.com</p>


      <p><strong>Is my postcode stored?</strong><br />
      No - postcodes are only used to look up your MP's constituency. Use some other postcode if you prefer. Here's Starmer's - WC2B6NH</p>

      <p><strong>How did you do this?</strong></p>
      <p>
        This site uses React for the frontend and Node.js for the backend. The MP data is fetched from the UK government public API, and the AI-generated images use the latest model from open AI. The images are stored on a Cloudflare R2 bucket.
        The code is open source, so you can check it out on <a href="https://github.com/timje/use-my-mps-id">GitHub</a>. It was done in a hurry.</p>
    </div>
  );
}

export default Faq;