export default function ratingColor(letters: string) {
  // const lowerCaseLetters = letters.toUpperCase();

  if (
    letters === "Extremely High" ||
    letters === "High+" ||
    letters === "High" ||
    letters === "AAA" ||
    letters === "AAA+" ||
    letters === "AAA-" ||
    letters === "AA" ||
    letters === "AA+" ||
    letters === "AA-" ||
    letters === "A" ||
    letters === "A-" ||
    letters === "A+"
  ) {
    return "#43A047";
  } else if (
    letters === "Moderate+" ||
    letters === "Moderate" ||
    letters === "Moderate-" ||
    letters === "BBB" ||
    letters === "BBB+" ||
    letters === "BBB-" ||
    letters === "BB" ||
    letters === "BB+" ||
    letters === "BB-" ||
    letters === "B" ||
    letters === "B-" ||
    letters === "B+"
  ) {
    return "#E6C700";
  } else if (
    letters === "Low" ||
    letters === "Low-" ||
    letters === "Extremely Low" ||
    letters === "CCC" ||
    letters === "CCC+" ||
    letters === "CCC-" ||
    letters === "CC" ||
    letters === "CC+" ||
    letters === "CC-" ||
    letters === "C" ||
    letters === "C-" ||
    letters === "C+"
  ) {
    return "#FFA726";
  } else if (letters === "D" || letters === "Negative") {
    return "#E53935";
  } else {
    // Handle other cases or return a default color
    return "black";
  }
}
