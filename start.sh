#!/bin/bash

set -e

# Update dependencies
if [ "$1" == "-update" ]; then
	clear
	echo "Updating dependencies..."
	npm update
fi

#############################################################
# STARTUP
#############################################################

# Automatically stop Apache
apache_was_running=false
# Do we have systemctl? Eg. linux env
if [ -n "$(command -v systemctl)" ]; then
	# See if Apache service exists
	apache_service="$(systemctl status apache2 | grep Active)"
	if [ -n "$apache_service" ]; then
		# See if Apache service is running
		if [[ "$apache_service" != *"inactive"* ]]; then
			apache_was_running=true
		fi
	fi
fi
if $apache_was_running; then
	clear
	echo "Stopping Apache for you..."
	if [ -n "$(command -v sudo)" ]; then
		sudo systemctl stop apache2
	else
		systemctl stop apache2
	fi
else
	echo "$apache_service"
fi

# Caddy in background
clear
echo "Starting Caddy..."

# Check if already running, stop if so in case of different project
caddy stop 2>/dev/null || true # Ignore if there's an error - might not be running

caddy start

clear
echo "Starting NPM dev..."
npm run dev

#############################################################
# TEARDOWN
#############################################################

# Stop Caddy
clear
echo "Stopping Caddy..."
caddy stop

# Automatically restart Apache if it was running before
if $apache_was_running; then
	clear
	echo "Starting Apache back up for you..."
	if [ -n "$(command -v sudo)" ]; then
		sudo systemctl start apache2
	else
		systemctl start apache2
	fi
fi
