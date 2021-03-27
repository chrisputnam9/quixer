<script>
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
    console.log('handleClientLoad');
    gapi.load('client:auth2', initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
    gapi.client
      .init({
        apiKey: GOOGLE_DRIVE_API_KEY,
        clientId: GOOGLE_DRIVE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.appdata'
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        },
        function (error) {
          appendPre(JSON.stringify(error, null, 2));
        }
      );
  }
</script>

<h1>Config</h1>

<br />API KEY:: {GOOGLE_DRIVE_API_KEY}
<br />CLIENT ID: {GOOGLE_DRIVE_CLIENT_ID}
<br />

<svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={handleClientLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()"></script>
</svelte:head>
