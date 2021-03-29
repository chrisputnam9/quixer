<script>
  let isSignedIn = false;
  let config = {
    test: 'test123'
  };
  let error = '';

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  function handleClientLoad() {
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
        },
        function (error) {
          error = JSON.stringify(error, null, 2);
        }
      );
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(_isSignedIn) {
    isSignedIn = _isSignedIn;

    // Try loading application config
    if (isSignedIn) {
      console.log('Getting config files');
      gapi.client.drive.files
        .list({
          spaces: 'appDataFolder',
          q: 'name = "config.json"',
          fields: 'nextPageToken, files(id, name)',
          pageSize: 100
        })
        .then(
          function (response) {
            if (response.result.files && response.result.files.length > 0) {
              console.log(response.result.files.length);
            } else {
              error = 'No config file saved yet';
            }
          },
          function (_error) {
            error = JSON.stringify(_error);
          }
        );
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  function signIn(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function signOut(event) {
    gapi.auth2.getAuthInstance().signOut();
  }
</script>

<h1>Config</h1>

<h2>Sync with Google Drive</h2>
{#if isSignedIn}
  <button on:click={signOut}>Sign Out</button>
{:else}
  <button on:click={signIn}>Authorize</button>
{/if}
{#if error}
  <strong style="color:red;">{error}</strong>
{/if}

<h2>Custom Services</h2>

<svelte:head>
  <script
    async
    defer
    src="https://apis.google.com/js/api.js"
    on:load={handleClientLoad}
    onreadystatechange="if (this.readyState === 'complete') this.onload()"></script>
</svelte:head>
