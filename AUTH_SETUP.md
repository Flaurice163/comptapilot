# Configuration de l’authentification

## Variables d’environnement

Définir ces variables dans Vercel (Development, Preview et Production selon les besoins), puis redéployer :

- `SUPABASE_URL` : URL du projet Supabase.
- `SUPABASE_PUBLISHABLE_KEY` : clé publishable du projet.
- `APP_URL` : URL publique de l’application, sans slash final.

En local, utiliser le fichier `.env` ignoré par Git et démarrer avec `npm run dev:vercel`. Ne pas préfixer ces variables par `VITE_` : les fonctions Vercel les utilisent côté serveur et le navigateur ne reçoit que des cookies de session `HttpOnly`.

La clé `sb_publishable_...` est publique par conception, mais ce projet la conserve côté serveur conformément au choix de ne pas l’exposer au navigateur. Ne jamais utiliser une clé `service_role` ou `sb_secret_` dans l’application.

## Réglages Supabase Auth

1. Activer la confirmation d’adresse e-mail.
2. Définir le **Site URL** sur la même valeur que `APP_URL`.
3. Ajouter à la liste **Redirect URLs** :
   - `https://votre-domaine/api/auth`
   - `http://localhost:3000/api/auth` pour les essais locaux.
4. Adapter le modèle **Confirm signup** pour que son lien pointe vers :

   ```html
   <a href="{{ .SiteURL }}/api/auth?flow=signup&token_hash={{ .TokenHash }}&type=signup">
     Confirmer mon adresse e-mail
   </a>
   ```

5. Adapter le modèle **Reset password** :

   ```html
   <a href="{{ .SiteURL }}/api/auth?flow=recovery&token_hash={{ .TokenHash }}&type=recovery">
     Réinitialiser mon mot de passe
   </a>
   ```

Le lien de confirmation crée une session serveur et redirige vers `/dashboard`. Le lien de récupération ouvre `/reset-password`. Configurer un SMTP adapté à la production afin d’assurer la délivrabilité et les limites d’envoi des e-mails.

## Périmètre actuel

L’authentification et les flux e-mail utilisent Supabase Auth. Les écritures comptables et le plan comptable du prototype ne sont pas encore chargés ni sauvegardés dans Supabase ; ils restent à connecter avant toute utilisation avec des données réelles.
