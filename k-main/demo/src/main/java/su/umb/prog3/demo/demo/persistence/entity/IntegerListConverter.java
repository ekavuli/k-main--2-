package su.umb.prog3.demo.demo.persistence.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class IntegerListConverter implements AttributeConverter<List<Integer>, String> {
    @Override
    public String convertToDatabaseColumn(List<Integer> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "";
        }
        return attribute.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    @Override
    public List<Integer> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return List.of();
        }
        return Arrays.stream(dbData.split(","))
                .map(Integer::valueOf)
                .collect(Collectors.toList());
    }
}
