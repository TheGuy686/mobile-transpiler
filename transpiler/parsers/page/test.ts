import Parser from '.';
import { outputLogging } from '../../classes/logger';

let input = `
Page {
  id: login

  Row {
      id: row
      backgroundColor: blue

      Image {
          id: img
          source: 'http://host.com/hello-there'
      }

      Column {
          id: col

          Text { text: 'example 1' }

          Text { 
              text: 'example 2' 
          }
      }
  }

  Button {
      id: btn
      anchors: {
          top: row.bottom;
          left: parent.left;
          right: parent.right;
      }
      text: 'A Button'
  }
}`;

let result = Parser.parse(input);
console.log(JSON.stringify(result, null, 4));
