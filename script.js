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

const DEFAULT_TAB = 'books'
const app = Vue.createApp({
  data() {
    const products = window.Products
    const allProducts = Object.values(products).flatMap((list) => list)
    const wishlist = withStorage(
      (storage) =>
        allProducts.filter((book) => storage.getItem(wishlistStorageKey(book)))
    )
    const selectedTab = DEFAULT_TAB
    return {
      products,
      searchString: null,
      visibleProducts: products[selectedTab],
      expanded: new Set(allProducts.filter((product) => product.expanded)),
      wishset: new Set(wishlist),
      wishlist,
      selectedTab,
    }
  },
  methods: {
    tabs() {
      const wishcount = this.wishcount()
      return [
        { id: 'books', title: 'Livros' },
        { id: 'boardgames', title: 'Boardgames' },
        { id: 'eletro', title: 'Eletroeletrônicos' },
        { id: 'sport', title: 'Esporte' },
        { id: 'moveis', title: 'Móveis' },
        { id: 'outros', title: 'Outros' },
        { id: 'wishlist', title: 'Minha Lista (' + (wishcount === 0 ? 'vazia' : wishcount) + ')' },
      ]
    },
    productsForCurrentTab() {
      return this.products[this.selectedTab] || []
    },
    selectTab(tabId) {
      this.selectedTab = tabId
      this.visibleProducts = this.productsForCurrentTab()
    },
    productList() {
      if (this.selectedTab === 'wishlist')
        return this.wishlist
      else
        return this.visibleProducts
    },
    search(searchString) {
      this.searchString = searchString
      const bookMatches = parseSearch(searchString)
      if (!bookMatches) {
        this.visibleProducts = this.productsForCurrentTab()
        return
      }
      this.visibleProducts = this.productsForCurrentTab().filter(bookMatches)
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
      return book.detailFields
        .flatMap(([fieldKey, title]) => {
          const text = book[fieldKey]
          if (text) {
            return [{ title, text }]
          }
          return []
        })
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
        "Oi, vi seu site e me interessei por esses itens aqui:\n\n" +
        this.wishlist.map(
          ({ creators, title, price }) =>
            [price, creators, title]
              .filter((value) => !!value)
              .join(' - ')
        ).join('\n')
      const whatsapp = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`
      window.open(whatsapp)
    },
    emailWishlist() {
      const subject = "Oi, quero esses itens!"
      const body =
        "Oi, vi seu site e me interessei por esses itens aqui:\n\n" +
        this.wishlist.map(
          ({ creators, title, price }) =>
            [price, creators, title]
              .filter((value) => !!value)
              .join(' - ')
        ).join('\n')
      const mailto = `mailto:Casa da Meg<mgarcia.si01@gmail.com>?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailto)
    }
  }
})
app.mount('#app')
