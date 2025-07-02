# Notio - Dein intelligenter Lernbegleiter

Willkommen bei Notio! Diese Anwendung ist ein intelligenter Begleiter, der dir hilft, deine Noten zu verwalten, deinen Lernerfolg zu analysieren und deine Ziele zu erreichen.

## Features

*   **Dashboard:** Eine personalisierbare Übersicht über deine Leistungen und anstehenden Termine.
*   **Fächer & Notenverwaltung:** Erfasse alle deine Noten und behalte den Überblick über deine Durchschnitte.
*   **KI-Tutor & Lern-Coach:** Erhalte personalisierte Lerntipps und stelle Fragen an einen KI-gestützten Tutor.
*   **Community:** Tausche dich mit anderen Nutzern aus, stelle Fragen und teile deine Erfolge.
*   **Lernsets:** Erstelle Karteikarten und lerne im verschiedenen Modi (Karteikarten, Schreiben, Quiz, etc.).
*   **Kalender:** Verwalte deinen Stundenplan und wichtige Schultermine.

## Lokale Entwicklung

Um die Anwendung lokal auszuführen, befolge diese Schritte:

1.  **Firebase-Projekt einrichten:** Du benötigst ein eigenes Firebase-Projekt mit aktivierter **Authentication** (E-Mail/Passwort & Google) und **Firestore Database**.

2.  **Umgebungsvariablen erstellen:** Erstelle im Hauptverzeichnis eine Datei namens `.env` und füge deine Firebase-Konfigurationsschlüssel hinzu:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=dein-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=deine-app-id
    ```

3.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

4.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```

Die Anwendung ist jetzt unter `http://localhost:9002` erreichbar.

## Ausführung mit Docker

Du kannst die Anwendung auch über Docker ausführen.

1.  **Docker-Image erstellen:** Führe diesen Befehl im Hauptverzeichnis aus, um das Image zu bauen. Wir nennen es `notio`.
    ```bash
    docker build -t notio .
    ```

2.  **Docker-Container starten:** Führe den folgenden Befehl aus, um einen Container aus dem Image zu starten. Ersetze die Platzhalter durch deine Firebase-Schlüssel.
    ```bash
    docker run -p 3000:3000 \
      -e NEXT_PUBLIC_FIREBASE_API_KEY="dein-api-key" \
      -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dein-auth-domain" \
      -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="dein-project-id" \
      -e NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dein-storage-bucket" \
      -e NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="dein-sender-id" \
      -e NEXT_PUBLIC_FIREBASE_APP_ID="dein-app-id" \
      notio
    ```

Die Anwendung ist anschließend unter `http://localhost:3000` erreichbar.
