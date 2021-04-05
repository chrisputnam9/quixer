<script>
  let isSignedIn = false;
  let isConfigSaved = false;

  let configLocal = {
    test: 'test123'
  };
  let configDrive = {};
  let configDriveId = 0;

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
        scope:
          'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file'
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
   * Sync local config with config saved on GDrive
   **/
  function syncConfig() {
    // TODO actually sync instead of overwriting
    configDrive = configLocal;

    // Make sure we're signed in
    if (!isSignedIn) {
      error = 'Sign in before attempting to sync';
      return false;
    }

    // Trying out CORS request instead
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    const oauthToken = user.getAuthResponse().access_token;
    // const oauthToken = gapi.auth2.getToken().access_token;

    // const file = new Blob([configDrive], 'application/json');
    const file = JSON.stringify(configDrive);
    const metadata = {
      name: 'config.json',
      mimeType: 'application/json',
      parents: ['appDataFolder']
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open(
      'post',
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id'
    );
    xhr.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
    xhr.responseType = 'json';
    xhr.onload = () => {
      console.log(xhr.response.id); // Retrieve uploaded file ID.
    };
    xhr.send(form);

    return;

    // Data for upload
    var fileMetadata = {
      name: 'config.json',
      parents: ['appDataFolder']
    };
    var media = {
      mimeType: 'application/json',
      body: JSON.stringify(configDrive)
    };

    // Create config file if needed
    if (!isConfigSaved) {
      console.log(fileMetadata);
      console.log(media);

      gapi.client.drive.files
        .create({
          resource: fileMetadata,
          media: media,
          fields: '*',
          uploadType: 'multipart'
        })
        //.then(response => response.json)
        .then(response => {
          const file = JSON.parse(response.body);
          configDriveId = file.id;
          error = 'Config created, ID: ' + configDriveId;
          console.log(file);
        })
        .catch(_error => {
          error = JSON.stringify(_error);
        });
    }
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
          //q: 'name = "config.json"',
          fields: 'nextPageToken, files(id, name)',
          pageSize: 1
        })
        .then(
          function (response) {
            console.log(response);
            if (response.result.files && response.result.files.length > 0) {
              configDriveId = response.result.files[0].id;
              console.log('Config found, ID: ' + configDriveId);
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
  {#if isConfigSaved}
    <button on:click={syncConfig}>Sync Config</button>
  {:else}
    <button on:click={syncConfig}>Save Config</button>
  {/if}
{:else}
  <button on:click={signIn}>Authorize</button>
{/if}
{#if error}
  <p><strong style="color:red;">{error}</strong></p>
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
