<template>
  <v-app dark>
    <v-content>
      <v-parallax
        dark
        src="/background.jpg"
      >
        <v-layout
          align-center
          column
          justify-center
        >
          <h1 :class="$vuetify.breakpoint.smAndUp ? 'display-4' : 'display-2'" class="font-weight-bold mb-3">
            METADATABASE
          </h1>
          <h2 class="display-1 font-weight-medium">
            Et open-source projekt udviklet under OS2geo gruppen
          </h2>
        </v-layout>
      </v-parallax>
      <v-sheet height="400px" color="primary">
        <v-container fill-height>
          <v-layout align-center>
            <v-flex>
              <p class="display-1">
                Her er det muligt at administrere og søge informationer, der beskriver geodatasæt og geodatatjenester
              </p>
              <v-layout column align-center pa-4>
                <v-btn
                  :to="localePath(route)"
                  nuxt
                  large
                  outline
                  round
                >
                  Kom i gang
                </v-btn>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
      <v-footer height="auto" dark class="white--text body-1" :fixed="$vuetify.breakpoint.smAndUp">
        <v-layout row wrap>
          <v-flex class="pa-3">
            <span class="display-3 font-weight-bold">OS2</span><span class="display-2 primary--text">geo</span>
          </v-flex>
          <v-flex class="pa-3">
            <span class="title">Jammerbugt Kommune</span>
            <br>Karen Frederiksen<br>
            <a href="mailto:kaf@jammerbugt.dk?Subject=Metadatabase">
              kaf@jammerbugt.dk
            </a>
          </v-flex>
          <v-flex class="pa-3">
            <span class="title">Frederiksberg Kommune</span>
            <br>Hasse Hauch<br>
            <a href="mailto:haha09@frederiksberg.dk?Subject=Metadatabase">
              haha09@frederiksberg.dk
            </a>
          </v-flex>
          <v-flex>
            <v-btn
              flat
              href="https://github.com/os2geo/metadatabase2-frontend"
              target="_blank"
            >
              <v-icon left>
                fab  fa-github
              </v-icon>
              <span class="title">Github</span>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-footer>
    </v-content>
  </v-app>
</template>

<script>
export default {
  head() {
    return {
      title: 'Metadatabase'
    }
  },
  computed: {
    route() {
      if (this.$store.state.auth.user) {
        if (this.$store.state.auth.user.organizationId) {
          return {
            name: 'organizations-id',
            params: { id: this.$store.state.auth.user.organizationId }
          }
        }
        if (this.$store.state.auth.user.roleId === 1) {
          return {
            name: 'system-organizations'
          }
        }
      }
      return { name: 'login' }
    }
  }
}
</script>
