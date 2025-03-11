<!doctype html>
<html>
    <head>
        <title>Weather Home Page</title>
        <meta charset="UTF-8">
        <meta name="description" content="Weather Forecasting">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Link stylesheet -->
        <link rel="stylesheet" href="style/style.css">

        <!-- Link Roboto font -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

        <!-- Link Weather icons -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css">
        
        <!-- Link Bootstrap -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </head>
    <body class="roboto-font-user">
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1">CIS 4004 Weather App</span>
                <!-- Navbar toggler for mobile -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <!-- Collapsible container for nav links, login/logout buttons, and dark mode toggle -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="forecast-map.html">Forecast Map</a>
                        </li>
                    </ul>
                    
                    <!-- Google Login / Logout Buttons -->
                    <div id="auth-buttons">
                        <a id="login-btn" href="/.auth/login/google?post_login_redirect_uri=/" class="btn btn-primary">Sign in with Google</a>
                        <a id="logout-btn" href="/.auth/logout?post_logout_redirect_uri=/" class="btn btn-danger" style="display:none;">Sign Out</a>
                    </div>
                    
                    <!-- Display login status -->
                    <span id="account-status" class="ms-3">Checking login status...</span>

                    <!-- Dark mode toggle -->
                    <div class="ms-3">
                        <label class="theme-switch mb-0">
                            <input type="checkbox" id="theme-toggle">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="container-fluid">
            <br><br>
            <h1>Future Forecast (24 hours)</h1>
            <h4><em>For your location</em></h4>
            <br>
            <div id="card-container">
                <div id="row-1" class="forecast-row"></div>
                <div id="row-2" class="forecast-row"></div>
            </div>
        </div>

        <!-- Include JavaScript for authentication and other scripts -->
        <script src="scripts.js"></script>

    </body>
</html>