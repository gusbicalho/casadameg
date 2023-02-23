const withStorage = (f) => {
  let storage;
  try {
    storage = window.localStorage
  } catch { }
  if (storage) {
    return f(storage)
  }
}

const wishlistStorageKey = ({ title }) => 'wishlist/' + title

const bookIncludes = ({ title, creators, ean_isbn13, upc_isbn10, description, notes }, searchString) =>
  (title && title.includes(searchString))
  || (creators && creators.includes(searchString))
  || (ean_isbn13 && ean_isbn13.includes(searchString))
  || (upc_isbn10 && upc_isbn10.includes(searchString))
  || (description && description.includes(searchString))

function withSearchString(book) {
  const { title, creators, ean_isbn13, upc_isbn10, description, notes } = book
  const searchString = [title, creators, ean_isbn13, upc_isbn10, description, notes]
    .filter((v) => !!v)
    .join(' ')
    .toUpperCase()
    .replace(/\W/g, ' ')
    .replace(/\s+/g, ' ')
  return { ...book, searchString }
}

function parseSearch(searchString) {
  const searchTerms = (searchString || '')
    .trim()
    .toUpperCase()
    .replace(/\W/g, ' ')
    .split(/\s+/g)
    .filter((s) => s)
  if (searchTerms.length === 0) {
    return null
  }
  return ({ searchString }) =>
    searchString &&
    searchTerms.some((term) => searchString.includes(term))
}

const BOOK_DETAIL_FIELDS = [
  ["creators", "Autoria"],
  ["ean_isbn13", "ISBN-13"],
  ["upc_isbn10", "ISBN-10"],
  ["description", "Descrição"],
  ["notes", "Notas"],
  ["length", "Páginas"],
]


const DEFAULT_TAB = 'all-books'
const app = Vue.createApp({
  data() {
    const books = Books
      .map(withSearchString)
      .sort((a, b) => a.searchString.localeCompare(b.searchString))
    const wishlist = withStorage(
      (storage) =>
        books.filter((book) => storage.getItem(wishlistStorageKey(book)))
    )
    return {
      books,
      searchString: null,
      visibleBooks: books,
      expanded: new Set(),
      wishset: new Set(wishlist),
      wishlist,
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
    toggleExpanded(book) {
      if (this.expanded.has(book)) {
        this.expanded.delete(book)
        this.expanded = this.expanded
      } else {
        this.expanded = this.expanded.add(book)
      }
    },
    isExpanded(book) {
      return this.expanded.has(book)
    },
    bookDetails(book) {
      const b = BOOK_DETAIL_FIELDS
        .flatMap(([fieldKey, title]) => {
          const text = book[fieldKey]
          if (text) {
            return [{ title, text }]
          }
          return []
        })
      console.log('bookDetails', b)
      return b
    },
    wishcount() {
      return this.wishset.size
    },
    isWishlistEmpty() {
      return this.wishcount() === 0
    },
    isInWishlist(book) {
      return this.wishset.has(book)
    },
    addToWishlist(book) {
      if (!this.isInWishlist(book)) {
        this.wishset = this.wishset.add(book)
        this.wishlist.push(book)
        this.wishlist = this.wishlist
        withStorage((storage) => {
          storage.setItem(wishlistStorageKey(book), true)
        })
      }
    },
    removeFromWishlist(book) {
      if (this.wishset.delete(book)) {
        this.wishset = this.wishset
        this.wishlist = this.wishlist.filter((someBook) => someBook !== book)
        withStorage((storage) => {
          storage.removeItem(wishlistStorageKey(book))
        })
      }
    },
    whatsappWishlist() {
      const phone = "5519983533555"
      const text =
        "Oi, vi seu site e me interessei por esses livros aqui:\n\n" +
        this.wishlist.map(({ creators, title, price }) => `${price} - ${creators} - ${title}`).join('\n')
      const whatsapp = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`
      window.open(whatsapp)
    },
    emailWishlist() {
      const subject = "Oi, quero esses livros!"
      const body =
        "Oi, vi seu site e me interessei por esses livros aqui:\n\n" +
        this.wishlist.map(({ creators, title, price }) => `${price} - ${creators} - ${title}`).join('\n')
      const mailto = `mailto:Casa da Meg<mgarcia.si01@gmail.com>?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailto)
    }
  }
})
app.mount('#app')
