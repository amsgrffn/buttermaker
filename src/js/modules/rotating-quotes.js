/**
 * Rotating Quotes Module
 * Displays a random quote from an array on each page load
 */

export function initRotatingQuotes() {
  // Array of quotes - each quote is an object with text, author, and optional link
  const quotes = [
    {
      text: 'I am putting myself to the fullest possible use which is all, I think, that any conscious entity can ever hope to do.',
      author: 'A Heuristically Programmed Algorithmic Computer',
      link: 'https://en.wikipedia.org/wiki/HAL_9000',
    },
    {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      link: 'https://en.wikipedia.org/wiki/Steve_Jobs',
    },
    {
      text: 'Innovation distinguishes between a leader and a follower.',
      author: 'Steve Jobs',
      link: 'https://en.wikipedia.org/wiki/Steve_Jobs',
    },
    {
      text: 'The best way to predict the future is to invent it.',
      author: 'Alan Kay',
      link: 'https://en.wikipedia.org/wiki/Alan_Kay',
    },
    {
      text: 'Any sufficiently advanced technology is indistinguishable from magic.',
      author: 'Arthur C. Clarke',
      link: 'https://en.wikipedia.org/wiki/Arthur_C._Clarke',
    },
    {
      text: 'The computer was born to solve problems that did not exist before.',
      author: 'Bill Gates',
      link: 'https://en.wikipedia.org/wiki/Bill_Gates',
    },
    {
      text: "Code is like humor. When you have to explain it, it's bad.",
      author: 'Cory House',
      link: null,
    },
    {
      text: 'Those who have a why to live, can bear with almost any how.',
      author: 'Viktor E. Frankl',
      link: 'https://en.wikipedia.org/wiki/Viktor_Frankl',
    },
    {
      text: 'No one beats Vitas Gerulaitis 17 times in a row.',
      author: 'Vitas Gerulaitis',
      link: 'https://en.wikipedia.org/wiki/Vitas_Gerulaitis',
    },
    {
      text: 'Slump? I ain’t in no slump. I just ain’t hittin.',
      author: 'Yogi Berra',
      link: 'https://en.wikipedia.org/wiki/Yogi_Berra',
    },
  ];

  const endCredits = document.querySelector('.end-credits');

  if (!endCredits) {
    return; // Exit if element doesn't exist on this page
  }

  // Get a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Build the HTML for the quote
  let quoteHTML = `"${quote.text}" &mdash; `;

  if (quote.link) {
    quoteHTML += `<a href="${quote.link}">${quote.author}</a>`;
  } else {
    quoteHTML += quote.author;
  }

  // Update the paragraph content
  endCredits.innerHTML = quoteHTML;

  console.log('💬 Rotating Quotes initialized');
}
