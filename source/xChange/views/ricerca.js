<<<<<<< HEAD
var app = new Vue({
    el: '#app',
    data: {
      users: []
    },
    mounted: function() {
      axios.get('../search') //nostro server
          .then(response => {
            this.users = response.data;
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
    }
  })
=======
var vm =new Vue({
    el: '#app_vue',
    data: {
        primo:[
            {img:'image.png'},
            {text:'Alberto'},
            {id:'1'},
            {professione:'pizzaiolo'},
            {punteggio:'5/5'}
        ],
        secondo:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'marco'},
            {id:'2'},
            {professione:'pizzaiolo'},
            {punteggio:'4/5'}
        ], 
        terzo:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'franco'},
            {id:'3'},
            {professione:'pizzaiolo'},
            {punteggio:'4/5'}
        ], 
        quarto:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'luca'},
            {id:'4'},
            {professione:'pizzaiolo'},
            {punteggio:'3/5'}
        ], 
        quinto:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'chiara'},
            {id:'5'},
            {professione:'pizzaiolo'},
            {punteggio:'4/5'}
        ], 
        sesto:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'cinzia'},
            {id:'6'},
            {professione:'pizzaiolo'},
            {punteggio:'5/5'}
        ], 
        settimo:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'simone'},
            {id:'7'},
            {professione:'pizzaiolo'},
            {punteggio:'0/5'}
        ],
        ottavo:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'giacomo'},
            {id:'8'},
            {professione:'pizzaiolo'},
            {punteggio:'5/5'}
        ],
        nono:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'lorenzo'},
            {id:'9'},
            {professione:'pizzaiolo'},
            {punteggio:'5/5'}
        ],
        decimo:[
            {img:'https://source.unsplash.com/collection/190727/100x150'},
            {text:'o fratm ingustament carcerat'},
            {id:'10'},
            {professione:'pizzaiolo'},
            {punteggio:'5/5'}
        ]  
    },
    methods: {
        //prendo da server 
    }
});
>>>>>>> fa64f9b27f397a0e92303f56bb8f4153d1ed01a1
