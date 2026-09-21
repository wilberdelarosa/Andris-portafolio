import https from 'https';
const key = process.env.TRELLO_KEY;
const token = process.env.TRELLO_TOKEN;
https.get(\https://api.trello.com/1/boards/ft66gyEO/lists?cards=open&key=\&token=\\, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    data.forEach(l => {
      console.log('\n--- ' + l.name + ' ---');
      l.cards.forEach(c => console.log('- ' + c.name + ' (' + c.id + ')'));
    });
  });
});
