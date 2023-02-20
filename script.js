const ALL_TABS = [
  { id: 'all-books', title: 'Todos os Livros' },
  { id: 'wishlist', title: 'Minha Lista' },
]

const bookId = ({ ean_isbn13 }) => ean_isbn13

const bookIncludes = ({ title, creators, ean_isbn13, upc_isbn10, description }, searchString) =>
  (title && title.includes(searchString))
  || (creators && creators.includes(searchString))
  || (ean_isbn13 && ean_isbn13.includes(searchString))
  || (upc_isbn10 && upc_isbn10.includes(searchString))
  || (description && description.includes(searchString))

function parseSearch(searchString) {
  const clearSearch = searchString && searchString.trim()
  if (!clearSearch) {
    return null
  }
  return (book) => bookIncludes(book, clearSearch)
}

const BookCard = {
  props: ['book'
    // , 'isInWishlist', 'addToWishlist', 'removeFromWishlist'
  ],
  template: `
    <img v-if="book.image" :src="'images/' + book.image + '.jpg'" />
    <div v-else="book.image" class="no-image">Sem foto :(</div>
    <div class="title">{{book.title}}</div>
    <div class="price">{{book.price}}</div>
    <div class="actions">
      <button v-if="!this.isInWishlist(book)" @click="() => this.addToWishlist(book)">Bota na lista! ❤️</button>
      <button v-if="this.isInWishlist(book)" @click="() => this.removeFromWishlist(book)">Não quero mais
        😞</button>
    </div>
  `
}

const DEFAULT_TAB = 'all-books'
const app = Vue.createApp({
  components: {
    BookCard
  },
  data() {
    return {
      books: Books,
      searchString: null,
      visibleBooks: Books,
      wishset: new Set(),
      wishlist: [],
      selectedTab: DEFAULT_TAB,
    }
  },
  methods: {
    tabs() {
      const wishcount = this.wishcount()
      return [
        { id: 'all-books', title: 'Todos os Livros' },
        { id: 'wishlist', title: 'Minha Lista (' + (wishcount === 0 ? 'vazia' : wishcount) + ')' },
      ]
    },
    selectTab(tabId) {
      this.selectedTab = tabId
    },
    booklist() {
      if (this.selectedTab === 'wishlist')
        return this.wishlist
      if (this.selectedTab === 'all-books')
        return this.visibleBooks
    },
    search(searchString) {
      this.searchString = searchString
      const bookMatches = parseSearch(searchString)
      if (!bookMatches) {
        this.visibleBooks = this.books
        return
      }
      this.visibleBooks = this.books.filter(bookMatches)
    },
    wishcount() {
      return this.wishset.size
    },
    isInWishlist(book) {
      return this.wishset.has(bookId(book))
    },
    addToWishlist(book) {
      if (!this.isInWishlist(book)) {
        this.wishset = this.wishset.add(bookId(book))
        this.wishlist.push(book)
        this.wishlist = this.wishlist
      }
    },
    removeFromWishlist(book) {
      if (this.wishset.delete(bookId(book))) {
        this.wishset = this.wishset
        this.wishlist = this.wishlist.filter((someBook) => bookId(someBook) !== bookId(book))
      }
    }
  }
})
app.mount('#app')
