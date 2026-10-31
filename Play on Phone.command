#!/bin/zsh
cd "${0:A:h}"
phone_ip=$(/usr/sbin/ipconfig getifaddr en0 2>/dev/null)
if [[ -z "$phone_ip" ]]; then
  phone_ip=$(/usr/sbin/ipconfig getifaddr en1 2>/dev/null)
fi
print "Connect your phone to the same Wi-Fi as this Mac."
print "Open http://${phone_ip:-YOUR-MAC-IP}:8081/?v=9.1 in Safari or Chrome, then turn the phone sideways."
print "Keep this window open while playing. Press Control-C to stop."
python3 -m http.server 8081 --bind 0.0.0.0
