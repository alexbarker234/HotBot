const fs = require('fs');
const ical = require('node-ical');

module.exports = {
    name: 'whereis',
    description: 'find the hotties',
    usage: "%PREFIX%whereis [name] <day> <time>",
    hidden: true,
    execute(client, message, args, user, userStats){       
        var toPrint = '';

        for (let i = 0; i <= args.length; i++) if(args[i]) args[i] = args[i].toLowerCase();
        
        if (args[0] == "hotbot") return message.channel.send("im in the cloud!");

        let days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        var today = new Date();
        var hour = today.getHours() + 8; // ✨ timezones ✨
        var day = today.getDay();

        if (!isNaN(args[1])) day =  parseInt(args[1]); // check if number
        else if (args[1]) {
            for (let i = 0; i < days.length; i++) {
                if (days[i].includes(args[1])) {
                    day = i + 1;
                    break;
                }
            }
        }
        if (args[2])
        {
            if (args[2].includes("am")) hour = args[2].replace( /[^0-9]/g, '');
            else if (args[2].includes("pm")) hour = parseInt(args[2].replace( /[^0-9]/g, '')) + 12;
            else hour = args[2];
        }
        console.log(day);
        console.log(hour);

        if (day >= 6) return message.channel.send('its the weekend? im relaxing hottie, you should try it.');
        else if (hour < 9) return message.channel.send('no clue babe im still sleeping');
        else if (hour > 19) return message.channel.send('its so late ask them yourself'); 
        else
        {
          if (!fs.existsSync('./ical/' + args[0] + '.ics')) return message.channel.send('i dont recognise this hottie :(');
          const events = ical.sync.parseFile('./ical/' + args[0] + '.ics');
          for (const event of Object.values(events)) {
              
              if (event.start) // first one is just busted?
              {
                  // add 8 because time zone
                  let startHour = event.start.getHours() + 8;
                  let endHour = event.end.getHours() + 8;
                  //console.log('Summary: ' + event.summary + '\nHour: ' + startHour + '-' + endHour + '\nDay: ' + event.start.getDay() + '\n');
                  if ((hour >= startHour && hour < endHour) && event.start.getDay() == day)
                  { 
                      let unitName = event.summary;
                      unitName = unitName.substring(0,unitName.indexOf(",")); // removes the , Lab-01 or other thing

                      let location = event.description;
                      location = location.substring(location.indexOf("Location:") + 9, location.length);
                      
                      toPrint += unitName + " in " + location;
                      break;
                  }
              }
          };
        }
        if (toPrint == "") toPrint = "no idea darling, ask them yourself";
        message.channel.send(toPrint);
    }
}