import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

import { QuestionDefinition } from '../../types/checkIn';

type QuestionRendererProps = {
  question: QuestionDefinition;
  value: boolean | string | number | undefined;
  onChange: (value: boolean | string | number) => void;
};

export const QuestionRenderer = ({
  question,
  value,
  onChange,
}: QuestionRendererProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{question.title}</Text>
      {question.description ? (
        <Text style={styles.description}>{question.description}</Text>
      ) : null}

      {question.type === 'boolean' ? (
        <View style={styles.row}>
          <Pressable
            onPress={() => onChange(true)}
            style={[styles.option, value === true && styles.optionSelected]}
          >
            <Text style={styles.optionText}>Yes</Text>
          </Pressable>
          <Pressable
            onPress={() => onChange(false)}
            style={[styles.option, value === false && styles.optionSelected]}
          >
            <Text style={styles.optionText}>No</Text>
          </Pressable>
        </View>
      ) : null}

      {question.type === 'single-select' && question.options ? (
        <View style={styles.column}>
          {question.options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                value === option.value && styles.optionSelected,
              ]}
            >
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {question.type === 'number' ? (
        <TextInput
          keyboardType="numeric"
          style={styles.input}
          placeholder={question.placeholder}
          value={typeof value === 'number' ? String(value) : ''}
          onChangeText={(text) => {
            const parsed = Number(text);
            if (!Number.isNaN(parsed)) {
              onChange(parsed);
            } else if (text.trim() === '') {
              onChange(0);
            }
          }}
        />
      ) : null}

      {question.type === 'text' ? (
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={question.placeholder}
          value={typeof value === 'string' ? value : ''}
          multiline
          onChangeText={(text) => onChange(text)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#5a5a5a',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    gap: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#e0edff',
  },
  optionText: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
