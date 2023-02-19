const app = Vue.createApp({
  data() {
    return {
      books: Books
    }
  },
  methods: {
    bookNames() {
      return Books.map((book) => book.title);
    }
  }
})
app.mount('#app')
