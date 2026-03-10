function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}