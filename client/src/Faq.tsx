// Faq.tsx
function Faq() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Frequently Asked Questions</h1>
      <p><strong>What does this site do?</strong><br />
      This gives you an AI-generated mock driving licence for your MP based on public data. 
      This is useful given the recent Online Safety Act, which would otherwise require you to send your ID to a foreign identity checking service, or send your internet traffic to a foreign VPN.
	  </p>

      <p><strong>Is this illegal?</strong><br />
      I've scribbled 'this is satire' on the ID, so it can't be used for anything real.
      This is a parody site. It uses publicly available data about your MP. The ID number isn't valid and you can't (and shouldn't) use the ID for anything real.
      </p>

           <p><strong>Why have you done this?</strong><br />
     The Online Safety Act is a terrible piece of legislation that makes the internet worse for everyone. It is a weakening of privacy and security online, and it is being used to censor content that the government doesn't like.
    
     <br /><br />It's already being used to block people from accessing LGBTQ+ resources, sex education resources, substance addiction resources and anti-war information. e.g. Al Jazeera News subreddit is now blocked unless you provide your ID. Because the legislation is intentionally vague, it has a chilling effect on the global internet, and seems more like something that would be passed in Russia or China.
	 
     <br /><br />Sites hosting adult content are incentivised to run age verification checks as cheaply (i.e. insecurely) as possible.     
     When the inevitable happens and the data is all leaked, I think it would be funny to see our MPs' IDs in there.
      </p> 


<p><strong>But what about protecting kids?</strong><br />
      It is important to protect children online. 
      Parental controls are already built into devices and ISPs and should be used.
      Children's platforms like Roblox have a duty of care to their users and should be held to account.<br />
      <br />This Act doesn't help with any of this.</p>

            <p><strong>Why is it taking so long to show me an ID?</strong><br />
      If this is the first time someone has asked for this MP, I generate a new MP ID using AI, which takes about a minute. <a href="https://www.buymeacoffee.com/timje" target="_blank" rel="noopener noreferrer">It's also expensive.</a></p>

            <p><strong>Who are you?</strong><br />
      I'm Tim, a software developer who is concerned about the Online Safety Act and its implications for privacy and security online.
      Harass me at feedback.timje@gmail.com</p>


      <p><strong>Is my postcode stored?</strong><br />
      No - postcodes are only used to look up your MP's constituency, nothing is stored. Use some other postcode if you prefer. Here's Kier Starmer's - WC2B6NH</p>

      <p><strong>How does this actually work?</strong><br />      
      React frontend, Node.js backend. MP data comes from the UK government's API. AI images are generated using OpenAI and stored via Cloudflare R2. Only the MP's name goes into the AI - everything else (DoB, Address, Photo, ID numbers) is nonsense. It was done in a hurry.</p>
    </div>
  );
}

export default Faq;