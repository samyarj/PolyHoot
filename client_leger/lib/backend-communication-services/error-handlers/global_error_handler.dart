import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart';

String getCustomError(error) {
  if (error is FirebaseAuthException) {
    return getFirebaseAuthError(error);
  } else if (error is FirebaseException) {
    return getCustomFirestoreError(error);
  } else if (error is SocketException) {
    return "Impossible de se connecter au serveur. Vérifiez votre connexion Internet.";
  } else if (error is ClientException) {
    return "Une erreur avec une requête est survenue. Vérifier votre connexion Internet";
  } else if (error.toString().contains("Détails:") ||
      error.toString().contains("Une")) {
    return error.toString().replaceAll("Exception: ", "");
  } else {
    return "Une erreur est survenue. Détails: ${error.toString().replaceAll("Exception: ", "")}";
  }
}

String getCustomFirestoreError(FirebaseException error) {
  switch (error.code) {
    case 'aborted':
      return "Une erreur est survenue avec Firebase. L'opération a été annulée. Veuillez réessayer.";
    case 'already-exists':
      return "Une erreur est survenue avec Firebase. Ce document existe déjà.";
    case 'cancelled':
      return "Une erreur est survenue avec Firebase. L'opération a été annulée.";
    case 'data-loss':
      return "Une erreur est survenue avec Firebase. Perte de données critique. Veuillez vérifier votre connexion.";
    case 'deadline-exceeded':
      return "Une erreur est survenue avec Firebase. Le délai d'exécution de l'opération a été dépassé.";
    case 'failed-precondition':
      return "Une erreur est survenue avec Firebase. L'opération a été rejetée car le système n'est pas dans l'état requis.";
    case 'internal':
      return "Une erreur est survenue avec Firebase. Erreur interne. Veuillez réessayer.";
    case 'invalid-argument':
      return "Une erreur est survenue avec Firebase. Argument invalide spécifié.";
    case 'not-found':
      return "Une erreur est survenue avec Firebase. Le document demandé n'a pas été trouvé.";
    case 'ok':
      return "L'opération a été complétée avec succès.";
    case 'out-of-range':
      return "Une erreur est survenue avec Firebase. L'opération a dépassé la plage valide.";
    case 'permission-denied':
      return "Une erreur est survenue avec Firebase. Vous n'avez pas la permission d'effectuer cette opération.";
    case 'resource-exhausted':
      return "Une erreur est survenue avec Firebase. Les ressources sont épuisées. Essayez plus tard.";
    case 'unauthenticated':
      return "Une erreur est survenue avec Firebase. L'authentification est requise pour effectuer cette opération.";
    case 'unavailable':
      return "Une erreur est survenue avec Firebase. Le service est actuellement indisponible.";
    case 'unimplemented':
      return "Une erreur est survenue avec Firebase. L'opération n'est pas implémentée.";
    case 'unknown':
      return "Une erreur inconnue est survenue avec Firebase.";
    default:
      return "Une erreur est survenue avec Firebase. Veuillez réessayer.";
  }
}

String getFirebaseAuthError(FirebaseAuthException error) {
  switch (error.code) {
    case 'email-already-in-use':
      return "Une erreur est survenue avec l'authentification Firebase. L'adresse e-mail est déjà utilisée. Veuillez utiliser une autre adresse e-mail.";
    case 'invalid-email':
      return "Une erreur est survenue avec l'authentification Firebase. L'adresse e-mail fournie est invalide. Veuillez vérifier l'adresse e-mail.";
    case 'operation-not-allowed':
      return "Une erreur est survenue avec l'authentification Firebase. L'opération n'est pas permise.";
    case 'weak-password':
      return "Une erreur est survenue avec l'authentification Firebase. Le mot de passe est trop faible. Veuillez choisir un mot de passe plus fort.";
    case 'too-many-requests':
      return "Une erreur est survenue avec l'authentification Firebase. Trop de demandes ont été envoyées. Veuillez attendre un peu avant de réessayer.";
    case 'user-token-expired':
      return "Une erreur est survenue avec l'authentification Firebase. Le jeton d'authentification de l'utilisateur a expiré. Veuillez vous reconnecter.";
    case 'network-request-failed':
      return "Une erreur est survenue avec l'authentification Firebase. Une erreur de connexion réseau s'est produite. Vérifiez votre connexion internet.";
    case 'user-disabled':
      return "Une erreur est survenue avec l'authentification Firebase. L'utilisateur correspondant à l'adresse e-mail a été désactivé.";
    case 'user-not-found':
      return "Une erreur est survenue avec l'authentification Firebase. Aucun utilisateur n'a été trouvé avec l'adresse e-mail fournie.";
    case 'wrong-password':
      return "Une erreur est survenue avec l'authentification Firebase. Le mot de passe est incorrect. Veuillez réessayer.";
    case 'invalid-credential':
      return "Une erreur est survenue avec l'authentification Firebase. Les informations d'identification sont invalides. Veuillez vérifier vos données.";
    default:
      return "Une erreur est survenue avec l'authentification Firebase.";
  }
}
